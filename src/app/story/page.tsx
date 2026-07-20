import Reveal from "../../components/ui/Reveal";
import EditorialImage from "../../components/ui/EditorialImage";
import { ButtonLink } from "../../components/ui/Button";
import Breadcrumbs from "../../components/common/Breadcrumbs";

export default function StoryPage() {
  return (
    <main className="bg-ivory">
      {/* Hero */}
      <section className="pt-[108px] lg:pt-[150px] pb-16 lg:pb-24">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
          <Breadcrumbs className="mb-8 sm:mb-10" />
          <Reveal>
            <p className="eyebrow text-bronze-deep mb-6">Story · Genesis by Preethy</p>
            <h1 className="font-display font-light leading-[1.05] text-[clamp(2.5rem,6vw,5rem)] text-ink max-w-4xl">
              A house begun by a woman who had already spent nineteen years shaping
              how rooms make people feel.
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="font-sans text-[15px] leading-[1.9] text-muted max-w-xl mt-8">
              Genesis is clothing designed in Kochi, Kerala — for the heat, the humidity
              and the monsoon that shape real days here, and for the woman over forty who
              has stopped dressing to be noticed and started dressing to be herself.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Block one — the designer's eye */}
      <section className="bg-ivory">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <Reveal scaleFrom={0.97} className="group order-1">
              <EditorialImage
                src="/products/test-1.jpg"
                placeholderLabel="The Designer"
                alt="Preethy at work in the Genesis studio in Kochi"
                ratio="aspect-[4/5]"
              />
            </Reveal>
            <Reveal delay={0.1} className="order-2">
              <p className="eyebrow text-bronze-deep mb-6">An Interior Designer's Eye</p>
              <h2 className="font-display font-light leading-[1.1] text-[clamp(1.9rem,4vw,3.1rem)] text-ink mb-7">
                The same questions a room asks, a garment asks too.
              </h2>
              <div className="space-y-5 max-w-xl">
                <p className="font-sans text-[15px] leading-[1.85] text-muted">
                  For nineteen years, Preethy read light, proportion and material for a
                  living — how a space should hold a person, where a line should fall,
                  what a surface should do in the heat of the afternoon. Clothing, it
                  turned out, was the same discipline worn closer to the body.
                </p>
                <p className="font-sans text-[15px] leading-[1.85] text-muted">
                  Genesis is what happened when that eye turned from walls to cloth: the
                  belief that what a woman wears should be composed with the same care as
                  the room she walks into, and should ask nothing of her once it is on.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pull quote */}
      <section className="bg-tan">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 section-pad text-center">
          <Reveal>
            <p className="font-display font-light italic leading-[1.2] text-[clamp(1.8rem,4vw,3rem)] text-ink">
              &ldquo;I did not want clothing that performs. I wanted clothing that lets a
              woman look like herself — with more ease, and more precision, than
              before.&rdquo;
            </p>
            <p className="eyebrow text-bronze-deep mt-8">Preethy · Founder</p>
          </Reveal>
        </div>
      </section>

      {/* Block two — designed for Kochi */}
      <section className="bg-ivory">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 section-pad">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <Reveal delay={0.1} className="order-2 lg:order-1">
              <p className="eyebrow text-bronze-deep mb-6">Designed in Kochi</p>
              <h2 className="font-display font-light leading-[1.1] text-[clamp(1.9rem,4vw,3.1rem)] text-ink mb-7">
                Made for 32°C, humidity, and the long monsoon.
              </h2>
              <div className="space-y-5 max-w-xl">
                <p className="font-sans text-[15px] leading-[1.85] text-muted">
                  Everything begins with the weather it will actually be worn in. Fabric
                  either lets you breathe or it does not; a garment either holds its line
                  through a wet afternoon or it starts to fight the body. Every piece is
                  drawn against that test before anything else.
                </p>
                <p className="font-sans text-[15px] leading-[1.85] text-muted">
                  Breathable structure, considered weight, cuts that stay quiet in the
                  heat — this is what tropical-intelligent clothing means here. Not
                  clothing for a season somewhere else, but for the one outside the window.
                </p>
              </div>
            </Reveal>
            <Reveal scaleFrom={0.97} className="group order-1 lg:order-2">
              <EditorialImage
                src="/images/collection-banner.jpg"
                placeholderLabel="Kochi, Kerala"
                alt="Light and cloth in the Genesis studio, Kochi"
                ratio="aspect-[4/5]"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Block three — the woman, considered production */}
      <section className="bg-ivory">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 pb-4 lg:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
            <Reveal>
              <p className="eyebrow text-bronze-deep mb-5">The Woman Over Forty</p>
              <p className="font-sans text-[15px] leading-[1.85] text-muted max-w-lg">
                Genesis is cut for the woman who already knows who she is. She is not
                dressing to be looked at; she is dressing for the life she is actually
                living — at home, at work, at the occasions that matter — and she wants
                clothing that meets her there with intelligence rather than noise.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="eyebrow text-bronze-deep mb-5">Considered Production</p>
              <p className="font-sans text-[15px] leading-[1.85] text-muted max-w-lg">
                Pieces are made in considered quantities, not mass volume. It keeps the
                making honest, the fit exact, and the run limited — so what you own stays
                a little rarer than most, and lasts long past the season it was drawn for.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-ivory">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 section-pad text-center">
          <Reveal>
            <h2 className="font-display font-light leading-[1.12] text-[clamp(1.9rem,4vw,3.1rem)] text-ink mb-8">
              The clearest way to understand it is to see the clothes.
            </h2>
            <ButtonLink href="/products" variant="outline" size="md">
              View the Collection
            </ButtonLink>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
