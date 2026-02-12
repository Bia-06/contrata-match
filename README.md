# 🍽️ ContrataMatch

> **O match perfeito para a sua carreira.**

Plataforma de recrutamento e seleção especializada no setor de gastronomia (bares, restaurantes, hotéis e cafés), com foco regional em **Marília** e **Garça**, São Paulo.

O projeto conecta talentos operacionais (cozinheiros, garçons, barman, etc.) a estabelecimentos que precisam contratar, simplificando o processo seletivo com um painel administrativo intuitivo e uma interface pública moderna.

---

## 🚀 Tecnologias Utilizadas

O projeto foi desenvolvido com uma stack moderna focada em performance e experiência do usuário:

-   **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
-   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
-   **Ícones:** [Lucide React](https://lucide.dev/)
-   **Backend & Banco de Dados:** [Supabase](https://supabase.com/) (Auth, Database, Storage)
-   **Navegação & State Management:** React Hooks e Context API (nativa)

---

## ✨ Funcionalidades

### 🌍 Área Pública (Candidatos)
-   **Landing Page:** Design moderno com animações suaves e apresentação do serviço.
-   **Listagem de Vagas:** Filtros por tipo de contrato (CLT, PJ, Extra) e modalidade.
-   **Busca Inteligente:** Pesquisa por cargo, empresa ou cidade.
-   **Aplicação Simplificada:** Formulário para envio de currículo (PDF/Doc) e dados sem necessidade de login.
-   **Catálogo de Restaurantes:** Vitrine das empresas parceiras.

### 🏢 Área Administrativa (Empresas)
-   **Dashboard:** Visão geral com métricas de vagas ativas e candidaturas recentes.
-   **Gestão de Vagas:** Criar, editar, pausar e excluir vagas.
    -   *Novo:* Definição de turno de trabalho e faixa etária.
-   **Gestão de Candidatos:** Visualização de currículos e status do candidato.
-   **Perfil da Empresa:** Edição de dados, logo, descrição e segmentos de atuação.

---

## 🛠️ Como Rodar o Projeto

Siga os passos abaixo para executar o projeto em sua máquina local.

### 1. Pré-requisitos
Certifique-se de ter o **Node.js** instalado em sua máquina.

### 2. Clonar o repositório

```bash
git clone [https://github.com/SEU-USUARIO/contrata-match.git](https://github.com/SEU-USUARIO/contrata-match.git)
cd contrata-match

### 3. Instalar dependências
Bash
npm install
# ou
yarn
### 4. Configurar Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto (baseado nas chaves do seu projeto no Supabase):

VITE_SUPABASE_URL=sua_url_do_supabase_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
Nota: Nunca compartilhe suas chaves service_role ou o arquivo .env publicamente.

### 5. Executar o projeto
Bash
npm run dev
O projeto estará rodando em http://localhost:5173.

### 🗄️ Estrutura do Banco de Dados (Supabase)
O projeto utiliza as seguintes tabelas principais:

companies: Dados das empresas contratantes.

jobs: Vagas publicadas (vinculadas às empresas).

applications: Candidaturas recebidas (vinculadas às vagas).

buckets: Storage para armazenamento de logotipos e currículos.

### 📱 Layout e Design
O design foi pensado para ser Mobile First, garantindo que tanto candidatos buscando vagas pelo celular quanto gestores acessando pelo computador tenham uma excelente experiência.