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
    const claudeApiKey = Deno.env.get("CLAUDE_KEY")!;
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
    
    if (arrayBuffer.byteLength > 5_000_000) {
      throw new Error("Currículo muito grande para análise. Reduza o tamanho do PDF (máx. 5MB).");
    }

    const base64Pdf = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

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

    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": claudeApiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: base64Pdf
                }
              },
              {
                type: "text",
                text: `Você é um especialista em análise de currículos e orientação profissional. 
Analise o currículo PDF acima e forneça insights práticos e acionáveis.

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
    const insights = aiData.content[0].text;

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
