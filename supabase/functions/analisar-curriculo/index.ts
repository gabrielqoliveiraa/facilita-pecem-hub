const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath } = await req.json();

    if (!filePath) {
      throw new Error("filePath é obrigatório");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const authHeader = req.headers.get("Authorization")!;

    console.log("Iniciando análise para:", filePath);

    // Get authenticated user
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        "Authorization": authHeader,
        "apikey": supabaseKey,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Usuário não autenticado");
    }

    const { id: userId } = await userResponse.json();
    console.log("Usuário autenticado:", userId);

    // Get user profile
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    let profile = null;
    if (profileResponse.ok) {
      const profiles = await profileResponse.json();
      profile = profiles[0];
    }

    console.log("Perfil carregado:", profile ? "Sim" : "Não");

    // Download PDF from storage
    const fileResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/curriculos/${filePath}`,
      {
        headers: {
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!fileResponse.ok) {
      throw new Error("Erro ao baixar currículo");
    }

    const fileBlob = await fileResponse.blob();
    const arrayBuffer = await fileBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log("PDF baixado, tamanho:", uint8Array.length, "bytes");

    // Impede análise de PDFs muito grandes (ex: > 2MB)
    if (uint8Array.length > 2_000_000) {
      throw new Error("Currículo muito grande para análise. Reduza o tamanho do PDF (máx. ~2MB).");
    }

    // Convert to base64 em pequenos blocos para evitar estouro de stack
    let base64 = "";
    const chunkSize = 3 * 1024; // 3KB por bloco
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const subArray = uint8Array.slice(i, i + chunkSize);
      let binaryChunk = "";
      for (let j = 0; j < subArray.length; j++) {
        binaryChunk += String.fromCharCode(subArray[j]);
      }
      base64 += btoa(binaryChunk);
    }

    console.log("PDF convertido para base64");

    // Parse PDF
    const parseResponse = await fetch("https://api.lovable.app/v1/parse-document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: base64,
        filename: "curriculo.pdf",
      }),
    });

    if (!parseResponse.ok) {
      throw new Error("Erro ao processar PDF");
    }

    const { text: curriculoTexto } = await parseResponse.json();
    console.log("PDF parseado, texto extraído:", curriculoTexto.length, "caracteres");

    // Limitar o tamanho do texto enviado para a IA para evitar estouro de pilha / payloads gigantes
    const MAX_CHARS = 20000; // ~20k caracteres devem ser suficientes para um currículo
    const curriculoTextoLimitado = curriculoTexto.slice(0, MAX_CHARS);
    if (curriculoTexto.length > MAX_CHARS) {
      console.log(
        "Texto do currículo maior que o limite, será truncado de",
        curriculoTexto.length,
        "para",
        MAX_CHARS,
        "caracteres"
      );
    }

    // Prepare context
    const userContext = profile ? `
Informações do usuário:
- Nome: ${profile.nome || "Não informado"}
- Idade: ${profile.idade || "Não informado"}
- Bairro: ${profile.bairro || "Não informado"}
- Escolaridade: ${profile.escolaridade || "Não informado"}
- Experiência: ${profile.experiencia || "Não informado"}
- Interesses: ${profile.interesses?.join(", ") || "Não informado"}
- Horários disponíveis: ${profile.horarios_disponiveis || "Não informado"}
- Tem internet: ${profile.tem_internet ? "Sim" : "Não"}
- Tem transporte: ${profile.tem_transporte ? "Sim" : "Não"}
` : "";

    // Call Lovable AI
    console.log("Chamando IA para análise...");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em análise de currículos e orientação profissional. 
Sua função é analisar o currículo fornecido e as informações do perfil do usuário para dar insights práticos e acionáveis.

Analise o currículo considerando:
1. Formatação e estrutura
2. Clareza das informações
3. Experiências e qualificações
4. Alinhamento com o perfil do usuário
5. Oportunidades de melhoria

Retorne os insights em formato de bullet points (use • para cada ponto), focando em:
- Pontos fortes do currículo
- Áreas que precisam de melhoria
- Sugestões específicas de como melhorar
- Alinhamento com interesses e objetivos do usuário

Seja direto, prático e construtivo. Máximo de 8-10 pontos.`
          },
          {
            role: "user",
            content: `${userContext}

Conteúdo do currículo (texto truncado se muito longo):
${curriculoTextoLimitado}

Por favor, analise este currículo e forneça insights para melhoria.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Erro da API AI:", errorText);
      throw new Error("Erro ao gerar análise");
    }

    const aiData = await aiResponse.json();
    const insights = aiData.choices[0].message.content;

    console.log("Análise concluída com sucesso");

    return new Response(
      JSON.stringify({ insights }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro na função:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
