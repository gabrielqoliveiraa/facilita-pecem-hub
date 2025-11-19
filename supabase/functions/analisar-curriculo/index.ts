const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("Arquivo PDF é obrigatório");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const authHeader = req.headers.get("Authorization")!;

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

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    if (uint8Array.length > 5_000_000) {
      throw new Error("Currículo muito grande para análise. Reduza o tamanho do PDF (máx. 5MB).");
    }

    let base64 = "";
    const chunkSize = 3 * 1024;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const subArray = uint8Array.slice(i, i + chunkSize);
      let binaryChunk = "";
      for (let j = 0; j < subArray.length; j++) {
        binaryChunk += String.fromCharCode(subArray[j]);
      }
      base64 += btoa(binaryChunk);
    }

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
            role: "user",
            content: [
              {
                type: "text",
                text: `Você é um especialista em análise de currículos e orientação profissional. 
Sua função é analisar o currículo PDF fornecido e as informações do perfil do usuário para dar insights práticos e acionáveis.

${userContext}

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
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`Erro ao gerar análise: ${errorText.slice(0, 200)}`);
    }

    const aiData = await aiResponse.json();
    const insights = aiData.choices[0].message.content;

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
