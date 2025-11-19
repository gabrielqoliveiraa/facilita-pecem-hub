import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Usuário não autenticado");
    }

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Erro ao buscar perfil:", profileError);
    }

    // Download PDF from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("curriculos")
      .download(filePath);

    if (downloadError) {
      throw new Error(`Erro ao baixar currículo: ${downloadError.message}`);
    }

    // Convert blob to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64 = btoa(String.fromCharCode(...uint8Array));

    // Parse PDF using Lovable's document parser
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

    // Prepare context about user
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

Conteúdo do currículo:
${curriculoTexto}

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

    return new Response(
      JSON.stringify({ insights }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro na função:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
