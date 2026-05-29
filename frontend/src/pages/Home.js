import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="home-page">
      <div className="hero">
        <div className="hero-text">
          <h1>Encontre um novo melhor amigo</h1>
          <p>
            O Adote um Amigo é uma plataforma desenvolvida para conectar pessoas
            a cães, gatos e outros animais que precisam de um lar cheio de
            cuidado, carinho e responsabilidade.
          </p>

          <div className="hero-buttons">
            <Link to="/animals" className="button-link">
              Ver animais
            </Link>

            <Link to="/register" className="button-secondary">
              Quero adotar
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="/nina.jpg"
            alt="Cachorro olhando para a câmera"
          />
        </div>
      </div>

      <div className="home-info">
        <div className="info-card">
          <h3>Perfis completos</h3>
          <p>
            Consulte informações sobre os animais disponíveis, incluindo espécie,
            cidade, origem e características principais.
          </p>
        </div>

        <div className="info-card">
          <h3>Busca facilitada</h3>
          <p>
            Utilize filtros por espécie, cidade e busca por nome para encontrar
            o animal ideal de forma rápida e prática.
          </p>
        </div>

        <div className="info-card">
          <h3>Cadastro de interesse</h3>
          <p>
            Demonstre interesse pela adoção preenchendo um formulário simples,
            validado e integrado com os animais disponíveis.
          </p>
        </div>
      </div>

      <div className="home-section">
        <div className="home-section-text">
          <h2>A adoção transforma vidas</h2>
          <p>
            Adotar um animal é um gesto de amor e responsabilidade. Além de
            oferecer um novo lar, você contribui para reduzir o abandono e cria
            a oportunidade de construir um vínculo especial com um companheiro
            fiel.
          </p>
          <p>
            Nossa plataforma foi pensada para facilitar esse processo, tornando
            a busca por um pet mais acessível, organizada e acolhedora.
          </p>
        </div>

        <div className="home-section-image">
          <img
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80"
            alt="Pessoa abraçando um cachorro"
          />
        </div>
      </div>

      <div className="care-section">
        <h2>Orientações para uma adoção responsável</h2>

        <div className="care-grid">
          <div className="care-card">
            <h3>Planejamento</h3>
            <p>
              Avalie seu espaço, sua rotina e seus recursos antes de adotar. Um
              animal precisa de atenção diária e compromisso contínuo.
            </p>
          </div>

          <div className="care-card">
            <h3>Saúde e bem-estar</h3>
            <p>
              Vacinas, alimentação adequada, higiene e acompanhamento veterinário
              são fundamentais para a qualidade de vida do pet.
            </p>
          </div>

          <div className="care-card">
            <h3>Adaptação</h3>
            <p>
              Cada animal possui seu próprio tempo para se adaptar a um novo
              lar. Paciência, carinho e ambiente seguro fazem diferença.
            </p>
          </div>
        </div>
      </div>

      <div className="cta-box">
        <h2>Pronto para encontrar seu novo companheiro?</h2>
        <p>
          Explore os animais disponíveis e escolha aquele que combina com você e
          com seu estilo de vida.
        </p>
        <Link to="/animals" className="button-link">
          Explorar animais
        </Link>
      </div>
    </section>
  );
}

export default Home;