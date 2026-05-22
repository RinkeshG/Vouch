"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import s from "./landing.module.css";

export default function LandingClient() {
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll-triggered reveals for sections
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(s.revealUp);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const revealSelectors = [
      `.${s.manifesto}`,
      `.${s.curators}`,
      `.${s.how}`,
      `.${s.cities}`,
      `.${s.closer}`,
      `.${s.glCard}`,
      `.${s.howStep}`,
      `.${s.cityRow}`,
      `.${s.feature}`,
    ].join(", ");

    document.querySelectorAll(revealSelectors).forEach((el) => {
      el.classList.add(s.reveal);
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  useEffect(() => {
    // Subtle parallax on hero list cards
    const stack = stackRef.current;
    if (!stack) return;
    const cards = stack.querySelectorAll<HTMLElement>(`.${s.listcard}`);

    function handleMouseMove(e: MouseEvent) {
      const r = stack!.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cards.forEach((c, i) => {
        const depth = (i + 1) * 4;
        const base = c.classList.contains(s.lc1)
          ? "rotate(4deg)"
          : c.classList.contains(s.lc2)
            ? "rotate(-5deg)"
            : c.classList.contains(s.lc3)
              ? "rotate(2.5deg)"
              : "rotate(-3deg)";
        c.style.transform = `translate3d(${-x * depth}px, ${-y * depth}px, 0) ${base}`;
      });
    }

    function handleMouseLeave() {
      cards.forEach((c) => {
        const base = c.classList.contains(s.lc1)
          ? "rotate(4deg)"
          : c.classList.contains(s.lc2)
            ? "rotate(-5deg)"
            : c.classList.contains(s.lc3)
              ? "rotate(2.5deg)"
              : "rotate(-3deg)";
        c.style.transform = base;
      });
    }

    stack.addEventListener("mousemove", handleMouseMove);
    stack.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      stack.removeEventListener("mousemove", handleMouseMove);
      stack.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const marqueeItems = [
    "Koshy’s",
    "MTR",
    "CTR",
    "Airlines",
    "Nagarjuna",
    "Subko",
    "Toast & Tonic",
    "Empire",
    "Vidyarthi Bhavan",
    "Corner House",
    "Permit Room",
    "Third Wave",
  ];

  return (
    <div className={s.landingRoot}>
      {/* Grain & texture overlays */}
      <div className={s.grain} />
      <div className={s.gradients} />

      {/* =========== UTILITY BAR =========== */}
      <div className={s.util}>
        <div className={s.utilInner}>
          <div>Vouch &mdash; Issue 01 &middot; Vol. 01 &middot; May 2026</div>
          <div className={s.utilPulse}>
            <span className={s.utilDot} /> Bangalore &mdash; Live now
          </div>
        </div>
      </div>

      {/* =========== NAV =========== */}
      <nav className={s.nav}>
        <div className={s.navInner}>
          <Link href="/" className={s.logo}>
            <span className={s.logoSeal}>V</span>
            <span>vouch</span>
          </Link>
          <div className={s.navLinks}>
            <a href="#manifesto" className={s.navLink}>
              The Idea
            </a>
            <a href="#curators" className={s.navLink}>
              Curators
            </a>
            <a href="#how" className={s.navLink}>
              How it works
            </a>
            <a href="#cities" className={s.navLink}>
              Cities
            </a>
          </div>
          <div className={s.navCta}>
            <Link href="/sign-in" className={cn(s.btn, s.btnBare)}>
              Sign in
            </Link>
            <Link href="/sign-up" className={cn(s.btn, s.btnInk)}>
              Create a list <span className={s.arrow}>&rarr;</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* =========== HERO =========== */}
      <section className={s.hero}>
        <div className={s.wrap}>
          <div className={s.heroGrid}>
            <div className={s.heroLeft}>
              <div className={cn(s.heroMeta, s.reveal, s.revealUp, s.d1)}>
                <span>
                  Featured this issue &mdash;{" "}
                  <span className={s.heroMetaBold}>Bangalore</span>
                </span>
                <span>Est. MMXXVI</span>
              </div>

              <h1 className={cn(s.heroTitle, s.reveal, s.revealUp, s.d2)}>
                <span className={s.heroTitleLine}>The places we&rsquo;d</span>
                <span className={s.heroTitleLine}>
                  <span className={s.heroTitleIt}>actually</span> send
                </span>
                <span className={s.heroTitleLine}>a friend to.</span>
              </h1>

              <p className={cn(s.heroSub, s.reveal, s.revealUp, s.d3)}>
                Vouch is a home for{" "}
                <span className={s.heroSubBold}>curated lists</span> of the
                places you love. Built for people who&rsquo;d rather text a
                friend than read a thousand reviews. Now open in{" "}
                <span className={s.heroSubBold}>Bangalore</span>.
              </p>

              <div className={cn(s.heroCta, s.reveal, s.revealUp, s.d4)}>
                <Link href="/sign-up" className={cn(s.btn, s.btnRust)}>
                  Start your first list <span className={s.arrow}>&rarr;</span>
                </Link>
                <Link href="/explore" className={cn(s.btn, s.btnBare)}>
                  See what&rsquo;s been vouched for
                </Link>
              </div>

              <div className={cn(s.heroNote, s.reveal, s.revealUp, s.d5)}>
                <svg
                  viewBox="0 0 40 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 18 C 8 10, 18 4, 38 2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M30 1 L38 2 L34 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                no star ratings. no Algorithm. just taste.
              </div>
            </div>

            <div
              ref={stackRef}
              className={cn(s.heroStack, s.reveal, s.revealUp, s.d3)}
            >
              {/* Card 1 */}
              <article className={cn(s.listcard, s.lc1)}>
                <div className={s.listcardBand}>
                  <span className={s.listcardBandEmoji}>&#x1F319;</span>
                  Late-night Bangalore
                </div>
                <div className={s.listcardBody}>
                  <div className={s.listcardMeta}>
                    <span className={s.listcardMetaBy}>by @mayakn</span>
                    <span>18 places</span>
                  </div>
                  <ul className={s.listcardPlaces}>
                    <li className={s.listcardPlacesItem}>
                      <span className={s.listcardPlaceName}>Koshy&rsquo;s</span>
                      <span className={s.listcardPlaceHood}>Church St</span>
                    </li>
                    <li className={s.listcardPlacesItem}>
                      <span className={s.listcardPlaceName}>
                        Empire (the real one)
                      </span>
                      <span className={s.listcardPlaceHood}>Indiranagar</span>
                    </li>
                    <li className={s.listcardPlacesItem}>
                      <span className={s.listcardPlaceName}>
                        CTR &mdash; after midnight
                      </span>
                      <span className={s.listcardPlaceHood}>Malleshwaram</span>
                    </li>
                  </ul>
                  <div className={s.listcardFooter}>
                    <span className={s.listcardSaves}>&#9829; 1,284 saves</span>
                    <span>Updated 2d ago</span>
                  </div>
                </div>
              </article>

              {/* Card 2 */}
              <article className={cn(s.listcard, s.lc2)}>
                <div className={s.listcardBand}>
                  <span className={s.listcardBandEmoji}>&#9749;</span>
                  Caf&eacute;s worth waking up for
                </div>
                <div className={s.listcardBody}>
                  <div className={s.listcardMeta}>
                    <span className={s.listcardMetaBy}>by @arjun_p</span>
                    <span>12 places</span>
                  </div>
                  <ul className={s.listcardPlaces}>
                    <li className={s.listcardPlacesItem}>
                      <span className={s.listcardPlaceName}>Subko</span>
                      <span className={s.listcardPlaceHood}>Indiranagar</span>
                    </li>
                    <li className={s.listcardPlacesItem}>
                      <span className={s.listcardPlaceName}>Third Wave</span>
                      <span className={s.listcardPlaceHood}>Indiranagar</span>
                    </li>
                    <li className={s.listcardPlacesItem}>
                      <span className={s.listcardPlaceName}>Blue Tokai</span>
                      <span className={s.listcardPlaceHood}>Koramangala</span>
                    </li>
                  </ul>
                  <div className={s.listcardFooter}>
                    <span className={s.listcardSaves}>&#9829; 842 saves</span>
                    <span>Updated 1w ago</span>
                  </div>
                </div>
              </article>

              {/* Card 3 */}
              <article className={cn(s.listcard, s.lc3)}>
                <div className={s.listcardBand}>
                  <span className={s.listcardBandEmoji}>&#x1F35B;</span>
                  Biryani, ranked.
                </div>
                <div className={s.listcardBody}>
                  <div className={s.listcardMeta}>
                    <span className={s.listcardMetaBy}>by @priyabng</span>
                    <span>9 places</span>
                  </div>
                  <ul className={s.listcardPlaces}>
                    <li className={s.listcardPlacesItem}>
                      <span className={s.listcardPlaceName}>Meghana</span>
                      <span className={s.listcardPlaceHood}>Residency Rd</span>
                    </li>
                    <li className={s.listcardPlacesItem}>
                      <span className={s.listcardPlaceName}>Rahhams</span>
                      <span className={s.listcardPlaceHood}>Frazer Town</span>
                    </li>
                    <li className={s.listcardPlacesItem}>
                      <span className={s.listcardPlaceName}>Nagarjuna</span>
                      <span className={s.listcardPlaceHood}>Residency Rd</span>
                    </li>
                  </ul>
                  <div className={s.listcardFooter}>
                    <span className={s.listcardSaves}>&#9829; 2,107 saves</span>
                    <span>Updated 4d ago</span>
                  </div>
                </div>
              </article>

              {/* Card 4 (peek behind) */}
              <article className={cn(s.listcard, s.lc4)}>
                <div className={s.listcardBand}>
                  <span className={s.listcardBandEmoji}>&#x1F96C;</span>
                  Veg, but make it good
                </div>
                <div className={s.listcardBody}>
                  <div className={s.listcardMeta}>
                    <span className={s.listcardMetaBy}>by @rinks_g</span>
                    <span>11 places</span>
                  </div>
                  <ul className={s.listcardPlaces}>
                    <li className={s.listcardPlacesItem}>
                      <span className={s.listcardPlaceName}>MTR</span>
                      <span className={s.listcardPlaceHood}>Lalbagh</span>
                    </li>
                    <li className={s.listcardPlacesItem}>
                      <span className={s.listcardPlaceName}>
                        Vidyarthi Bhavan
                      </span>
                      <span className={s.listcardPlaceHood}>Gandhi Bazaar</span>
                    </li>
                    <li className={s.listcardPlacesItem}>
                      <span className={s.listcardPlaceName}>CTR (idli)</span>
                      <span className={s.listcardPlaceHood}>Malleshwaram</span>
                    </li>
                  </ul>
                  <div className={s.listcardFooter}>
                    <span className={s.listcardSaves}>&#9829; 614 saves</span>
                    <span>Updated today</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className={s.marquee} aria-hidden="true">
          <div className={s.marqueeTrack}>
            {/* Original + duplicate for seamless loop */}
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className={s.marqueeItem}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =========== MANIFESTO =========== */}
      <section className={s.manifesto} id="manifesto">
        <div className={s.wrap}>
          <div className={s.manifestoGrid}>
            <div className={s.manifestoHead}>
              <div className={s.eyebrow}>The idea &mdash; page 01</div>
              <h2 className={s.manifestoTitle}>
                Algorithms can&rsquo;t taste.{" "}
                <em className={s.manifestoTitleEm}>People can.</em>
              </h2>
              <div className={s.manifestoBody}>
                <p>
                  Somewhere along the way, finding a good place to eat turned
                  into reading 400 reviews from 400 strangers and trusting an
                  average of their opinions. We&rsquo;ve all done it.
                  We&rsquo;ve all ended up at the wrong restaurant anyway.
                </p>
                <p>
                  Vouch is built on the opposite belief: the best
                  recommendation is from one person whose taste you actually
                  trust. Your friend who knows every dosa worth eating. The
                  colleague who&rsquo;s been to every caf&eacute;. The cousin
                  who can rank biryani.
                </p>
                <p>
                  So we made a place for those lists. Beautiful, opinionated,
                  shareable. The way recommendations were always supposed to
                  feel.
                </p>
              </div>
              <div className={s.manifestoStats}>
                <div>
                  <div className={s.statN}>512</div>
                  <div className={s.statL}>Curators in BLR</div>
                </div>
                <div>
                  <div className={s.statN}>1,847</div>
                  <div className={s.statL}>Lists published</div>
                </div>
                <div>
                  <div className={s.statN}>23k</div>
                  <div className={s.statL}>Places vouched</div>
                </div>
              </div>
            </div>

            <div className={s.feature}>
              <div className={s.featureCard}>
                <div className={s.featureBand}>
                  <div className={s.featureBandTop}>
                    <span>Featured list &mdash; week 21</span>
                    <span className={s.featureBandTopBold}>
                      Editor&rsquo;s pick
                    </span>
                  </div>
                  <h3 className={s.featureBandTitle}>
                    Slow dinners. No hurry.
                  </h3>
                  <div className={s.featureBandBy}>
                    by @kabir_d &middot; 7 places &middot; Updated yesterday
                  </div>
                </div>
                <div className={s.featureBody}>
                  <ol className={s.featureBodyOl}>
                    <li className={s.featureBodyLi}>
                      <span className={s.featureBodyName}>
                        Toast &amp; Tonic
                        <span className={s.featureBodyRow2}>
                          &rarr; go for the negroni, stay for the second one
                        </span>
                      </span>
                      <span className={s.featureBodyHood}>Ashok Nagar</span>
                    </li>
                    <li className={s.featureBodyLi}>
                      <span className={s.featureBodyName}>
                        ZLB23
                        <span className={s.featureBodyRow2}>
                          &rarr; book ahead. Sit at the bar.
                        </span>
                      </span>
                      <span className={s.featureBodyHood}>UB City</span>
                    </li>
                    <li className={s.featureBodyLi}>
                      <span className={s.featureBodyName}>
                        The Permit Room
                        <span className={s.featureBodyRow2}>
                          &rarr; Sunday lunch. Order the prawn balchao.
                        </span>
                      </span>
                      <span className={s.featureBodyHood}>Residency Rd</span>
                    </li>
                    <li className={s.featureBodyLi}>
                      <span className={s.featureBodyName}>
                        Naru
                        <span className={s.featureBodyRow2}>
                          &rarr; the omakase if it&rsquo;s a date
                        </span>
                      </span>
                      <span className={s.featureBodyHood}>Indiranagar</span>
                    </li>
                  </ol>
                </div>
                <div className={s.featureFooter}>
                  <span className={s.featureHeart}>&#9829; 1,492 saves</span>
                  <span>vouch.in/kabir/slow</span>
                </div>
              </div>

              <div className={cn(s.anno, s.anno1)}>
                <span>
                  <em className={s.annoEm}>personal notes</em> &mdash; not
                  generic reviews
                </span>
              </div>
              <div className={cn(s.anno, s.anno2)}>
                <span>color-coded, easy to skim &searr;</span>
              </div>
              <div className={cn(s.anno, s.anno3)}>
                <span>&nearr; your own URL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========== CURATORS =========== */}
      <section className={s.curators} id="curators">
        <div className={s.curatorsGrain} />
        <div className={s.wrap}>
          <div className={s.curatorsHead}>
            <div>
              <div className={cn(s.eyebrow, s.curatorsEyebrow)}>
                From the curators &mdash; page 02
              </div>
              <h3 className={s.curatorsTitle}>
                What Bangalore is{" "}
                <em className={s.curatorsTitleEm}>actually</em> recommending
                <br />
                this week.
              </h3>
            </div>
            <div className={s.curatorsMeta}>
              Updated daily &middot; 06 of 1,847 lists shown
            </div>
          </div>

          <div className={s.gridLists}>
            {/* Card 1 */}
            <article className={cn(s.glCard, s.c1, s.span4)}>
              <div className={s.glCardBand}>
                <div className={s.glCardBandRow}>
                  <span>List &#8470;01</span>
                  <span>@mayakn</span>
                </div>
                <h4 className={s.glCardBandTitle}>
                  <span className={s.glCardBandEmoji}>&#x1F319;</span>
                  Late-night Bangalore
                </h4>
              </div>
              <div className={s.glCardBody}>
                <ul className={s.glCardBodyList}>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>Koshy&rsquo;s</span>
                    <span className={s.glCardBodyHood}>Church St</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>
                      Empire (Indiranagar)
                    </span>
                    <span className={s.glCardBodyHood}>Indiranagar</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>CTR after midnight</span>
                    <span className={s.glCardBodyHood}>Malleshwaram</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>
                      Shivaji Military Hotel
                    </span>
                    <span className={s.glCardBodyHood}>Jayanagar</span>
                  </li>
                </ul>
              </div>
              <div className={s.glCardFoot}>
                <span>
                  <span className={s.glCardHeart}>&#9829;</span> 1,284
                </span>
                <span>18 places</span>
              </div>
            </article>

            {/* Card 2 */}
            <article className={cn(s.glCard, s.c2, s.span5)}>
              <div className={s.glCardBand}>
                <div className={s.glCardBandRow}>
                  <span>List &#8470;02</span>
                  <span>@arjun_p</span>
                </div>
                <h4 className={s.glCardBandTitle}>
                  <span className={s.glCardBandEmoji}>&#9749;</span>
                  Caf&eacute;s worth waking up for
                </h4>
              </div>
              <div className={s.glCardBody}>
                <ul className={s.glCardBodyList}>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>
                      Subko Specialty Coffee
                    </span>
                    <span className={s.glCardBodyHood}>Indiranagar</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>Third Wave Coffee</span>
                    <span className={s.glCardBodyHood}>Indiranagar</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>Blue Tokai</span>
                    <span className={s.glCardBodyHood}>Koramangala</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>Dyu Art Caf&eacute;</span>
                    <span className={s.glCardBodyHood}>Koramangala</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>Matteo Coffea</span>
                    <span className={s.glCardBodyHood}>Church St</span>
                  </li>
                </ul>
              </div>
              <div className={s.glCardFoot}>
                <span>
                  <span className={s.glCardHeart}>&#9829;</span> 842
                </span>
                <span>12 places</span>
              </div>
            </article>

            {/* Card 3 */}
            <article className={cn(s.glCard, s.c3, s.span3)}>
              <div className={s.glCardBand}>
                <div className={s.glCardBandRow}>
                  <span>List &#8470;03</span>
                  <span>@priyabng</span>
                </div>
                <h4 className={s.glCardBandTitle}>
                  <span className={s.glCardBandEmoji}>&#x1F35B;</span>
                  Biryani, ranked.
                </h4>
              </div>
              <div className={s.glCardBody}>
                <ul className={s.glCardBodyList}>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>Meghana</span>
                    <span className={s.glCardBodyHood}>Residency Rd</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>Rahhams</span>
                    <span className={s.glCardBodyHood}>Frazer Town</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>Nagarjuna</span>
                    <span className={s.glCardBodyHood}>Residency Rd</span>
                  </li>
                </ul>
              </div>
              <div className={s.glCardFoot}>
                <span>
                  <span className={s.glCardHeart}>&#9829;</span> 2,107
                </span>
                <span>9 places</span>
              </div>
            </article>

            {/* Card 4 */}
            <article className={cn(s.glCard, s.c4, s.span3)}>
              <div className={s.glCardBand}>
                <div className={s.glCardBandRow}>
                  <span>List &#8470;04</span>
                  <span>@rinks_g</span>
                </div>
                <h4 className={s.glCardBandTitle}>
                  <span className={s.glCardBandEmoji}>&#x1F96C;</span>
                  Veg, but make it good
                </h4>
              </div>
              <div className={s.glCardBody}>
                <ul className={s.glCardBodyList}>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>MTR</span>
                    <span className={s.glCardBodyHood}>Lalbagh</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>Vidyarthi Bhavan</span>
                    <span className={s.glCardBodyHood}>Gandhi Bazaar</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>CTR (idli)</span>
                    <span className={s.glCardBodyHood}>Malleshwaram</span>
                  </li>
                </ul>
              </div>
              <div className={s.glCardFoot}>
                <span>
                  <span className={s.glCardHeart}>&#9829;</span> 614
                </span>
                <span>11 places</span>
              </div>
            </article>

            {/* Card 5 */}
            <article className={cn(s.glCard, s.c5, s.span5)}>
              <div className={s.glCardBand}>
                <div className={s.glCardBandRow}>
                  <span>List &#8470;05</span>
                  <span>@kabir_d</span>
                </div>
                <h4 className={s.glCardBandTitle}>
                  <span className={s.glCardBandEmoji}>&#x1F377;</span>
                  Slow dinners. No hurry.
                </h4>
              </div>
              <div className={s.glCardBody}>
                <ul className={s.glCardBodyList}>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>Toast &amp; Tonic</span>
                    <span className={s.glCardBodyHood}>Ashok Nagar</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>ZLB23</span>
                    <span className={s.glCardBodyHood}>UB City</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>The Permit Room</span>
                    <span className={s.glCardBodyHood}>Residency Rd</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>Naru</span>
                    <span className={s.glCardBodyHood}>Indiranagar</span>
                  </li>
                </ul>
              </div>
              <div className={s.glCardFoot}>
                <span>
                  <span className={s.glCardHeart}>&#9829;</span> 1,492
                </span>
                <span>7 places</span>
              </div>
            </article>

            {/* Card 6 */}
            <article className={cn(s.glCard, s.c6, s.span4)}>
              <div className={s.glCardBand}>
                <div className={s.glCardBandRow}>
                  <span>List &#8470;06</span>
                  <span>@ananya_s</span>
                </div>
                <h4 className={s.glCardBandTitle}>
                  <span className={s.glCardBandEmoji}>&#x1F366;</span>
                  Sweet things, after.
                </h4>
              </div>
              <div className={s.glCardBody}>
                <ul className={s.glCardBodyList}>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>Corner House</span>
                    <span className={s.glCardBodyHood}>Residency Rd</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>Lakeview Milk Bar</span>
                    <span className={s.glCardBodyHood}>MG Road</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>Polar Bear</span>
                    <span className={s.glCardBodyHood}>Brigade Rd</span>
                  </li>
                  <li className={s.glCardBodyItem}>
                    <span className={s.glCardBodyName}>Hangyo</span>
                    <span className={s.glCardBodyHood}>multiple</span>
                  </li>
                </ul>
              </div>
              <div className={s.glCardFoot}>
                <span>
                  <span className={s.glCardHeart}>&#9829;</span> 938
                </span>
                <span>14 places</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* =========== HOW IT WORKS =========== */}
      <section className={s.how} id="how">
        <div className={s.wrap}>
          <div className={s.howHead}>
            <div>
              <div className={s.eyebrow}>The mechanics &mdash; page 03</div>
              <h3 className={s.howTitle}>
                From your head to the world.
                <br />
                In about <em className={s.howTitleEm}>two minutes.</em>
              </h3>
            </div>
            <p className={s.howLede}>
              No forms. No required fields. No nine-step onboarding. You name a
              list, you add places, you share a link. That&rsquo;s the entire
              product.
            </p>
          </div>

          <div className={s.howStrip}>
            {/* Step 1 */}
            <div className={s.howStep}>
              <div className={s.howNum}>01.</div>
              <h5 className={s.howStepTitle}>Claim a handle.</h5>
              <p className={s.howStepDesc}>
                Your handle becomes your URL. Quick, simple, yours forever.
              </p>

              <div className={s.phone}>
                <div className={s.phoneBar}>
                  <span>Pick your handle</span>
                  <span className={s.phoneBarRight}>
                    <span className={cn(s.phoneBarDot, s.phoneBarDotOn)} />
                    <span className={s.phoneBarDot} />
                    <span className={s.phoneBarDot} />
                  </span>
                </div>
                <div className={s.phoneScreen}>
                  <div className={s.hPick}>What should we call you?</div>
                  <div className={s.hInput}>
                    <span className={s.hInputAt}>@</span>
                    <span className={s.hInputYou}>rinks_g</span>
                    <span className={s.hInputCursor} />
                  </div>
                  <div className={s.hAvail}>
                    <span className={s.hAvailOk}>&#10003;</span> available
                  </div>
                  <div className={s.hUrl}>
                    your profile:{" "}
                    <span className={s.hUrlBold}>vouch.in/rinks_g</span>
                  </div>
                </div>
              </div>

              <div className={cn(s.howStepAnno, s.howStepAnno1)}>
                &uarr; yours forever
              </div>
            </div>

            {/* Step 2 */}
            <div className={s.howStep}>
              <div className={s.howNum}>02.</div>
              <h5 className={s.howStepTitle}>Build the list.</h5>
              <p className={s.howStepDesc}>
                Name it. Search. Tap to add. Feels like making a playlist, not
                filling a form.
              </p>

              <div className={cn(s.phone, s.phoneStep2)}>
                <div className={s.phoneBar}>
                  <span>Caf&eacute;s worth waking up for</span>
                  <span className={s.phoneBarRight}>
                    <span className={s.phoneBarDot} />
                    <span className={cn(s.phoneBarDot, s.phoneBarDotOn)} />
                    <span className={s.phoneBarDot} />
                  </span>
                </div>
                <div className={s.phoneScreen}>
                  <div className={s.bHead}>Add places &darr;</div>
                  <div className={s.bSub}>3 of 12 added</div>
                  <div className={s.bSearch}>&#x1F50D; third wave</div>
                  <ul className={s.bResults}>
                    <li className={s.bResultsItem}>
                      <div>
                        <div className={s.bResultsNm}>Third Wave Coffee</div>
                        <div className={s.bResultsHo}>Indiranagar</div>
                      </div>
                      <div className={cn(s.bAdd, s.bAddAdded)}>&#10003;</div>
                    </li>
                    <li className={s.bResultsItem}>
                      <div>
                        <div className={s.bResultsNm}>
                          Third Wave &mdash; HSR
                        </div>
                        <div className={s.bResultsHo}>HSR Layout</div>
                      </div>
                      <div className={s.bAdd}>+</div>
                    </li>
                    <li className={s.bResultsItem}>
                      <div>
                        <div className={s.bResultsNm}>Third Wave Roastery</div>
                        <div className={s.bResultsHo}>Koramangala</div>
                      </div>
                      <div className={s.bAdd}>+</div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className={cn(s.howStepAnno, s.howStepAnno2)}>
                no forms &searr;
              </div>
            </div>

            {/* Step 3 */}
            <div className={s.howStep}>
              <div className={s.howNum}>03.</div>
              <h5 className={s.howStepTitle}>Share the link.</h5>
              <p className={s.howStepDesc}>
                WhatsApp, Instagram, anywhere. Friends see a beautiful list, not
                an SEO blog.
              </p>

              <div className={cn(s.phone, s.phoneStep3)}>
                <div className={s.phoneBar}>
                  <span>Publish</span>
                  <span className={s.phoneBarRight}>
                    <span className={s.phoneBarDot} />
                    <span className={s.phoneBarDot} />
                    <span className={cn(s.phoneBarDot, s.phoneBarDotOn)} />
                  </span>
                </div>
                <div className={s.phoneScreen}>
                  <div className={s.sCard}>
                    <div className={s.sCardNm}>
                      Caf&eacute;s worth waking up for
                    </div>
                    <div className={s.sCardBy}>by @arjun_p</div>
                    <div className={s.sCardCt}>
                      12 places &middot; Bangalore
                    </div>
                  </div>
                  <div className={s.sShares}>
                    <div className={s.sSharesPill}>WhatsApp</div>
                    <div className={s.sSharesPill}>Instagram</div>
                    <div className={s.sSharesPill}>X</div>
                  </div>
                  <div className={s.sLink}>
                    <span>
                      vouch.in/arjun_p/
                      <span className={s.sLinkBold}>cafes</span>
                    </span>
                    <span className={s.sLinkCp}>Copy</span>
                  </div>
                </div>
              </div>

              <div className={cn(s.howStepAnno, s.howStepAnno3)}>
                screenshot-worthy &searr;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========== CITIES =========== */}
      <section className={s.cities} id="cities">
        <div className={s.wrap}>
          <div className={s.citiesGrid}>
            <div>
              <div className={s.eyebrow}>One city at a time &mdash; page 04</div>
              <h3 className={s.citiesTitle}>
                We go <em className={s.citiesTitleEm}>deep,</em>
                <br />
                before we go wide.
              </h3>
              <p className={s.citiesLede}>
                Every neighbourhood. Every local gem. Every late-night spot.
                Bangalore first &mdash; because the only thing better than a
                curated list is one made by someone who actually lives there.
              </p>

              <div className={s.citiesList}>
                <div className={cn(s.cityRow, s.cityRowLive)}>
                  <span className={s.cityRowIdx}>01</span>
                  <span className={s.cityRowName}>Bangalore</span>
                  <span className={s.cityRowPop}>512 curators</span>
                  <span className={cn(s.badge, s.badgeLive)}>
                    &#9679; Live
                  </span>
                </div>
                <div className={s.cityRow}>
                  <span className={s.cityRowIdx}>02</span>
                  <span className={s.cityRowName}>Bombay</span>
                  <span className={s.cityRowPop}>Q3 2026</span>
                  <span className={s.badge}>Soon</span>
                </div>
                <div className={s.cityRow}>
                  <span className={s.cityRowIdx}>03</span>
                  <span className={s.cityRowName}>Delhi</span>
                  <span className={s.cityRowPop}>Q4 2026</span>
                  <span className={s.badge}>Soon</span>
                </div>
                <div className={s.cityRow}>
                  <span className={s.cityRowIdx}>04</span>
                  <span className={s.cityRowName}>Goa</span>
                  <span className={s.cityRowPop}>2027</span>
                  <span className={s.badge}>Waitlist</span>
                </div>
              </div>
            </div>

            <div className={s.mapwrap}>
              {/* India map SVG */}
              <svg
                className={s.map}
                viewBox="0 0 400 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <filter
                    id="rough"
                    x="-5%"
                    y="-5%"
                    width="110%"
                    height="110%"
                  >
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.025"
                      numOctaves={2}
                      seed={3}
                    />
                    <feDisplacementMap in="SourceGraphic" scale={3} />
                  </filter>
                </defs>
                <path
                  d="M155 35 L175 40 L195 38 L220 50 L240 48 L260 60 L280 78 L290 100 L302 130 L300 160 L292 188 L298 210 L295 240 L280 270 L260 300 L240 330 L220 360 L205 395 L188 430 L172 455 L158 470 L148 460 L138 440 L130 415 L122 388 L115 360 L108 335 L100 308 L98 280 L100 252 L108 226 L115 200 L118 175 L112 150 L102 128 L92 106 L88 84 L98 62 L120 48 L140 38 Z"
                  stroke="#181210"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  fill="rgba(184,65,44,0.04)"
                  filter="url(#rough)"
                />
                <g
                  stroke="rgba(24,18,16,0.08)"
                  strokeWidth="0.5"
                  strokeDasharray="2 3"
                >
                  <line x1="0" y1="100" x2="400" y2="100" />
                  <line x1="0" y1="200" x2="400" y2="200" />
                  <line x1="0" y1="300" x2="400" y2="300" />
                  <line x1="0" y1="400" x2="400" y2="400" />
                  <line x1="100" y1="0" x2="100" y2="500" />
                  <line x1="200" y1="0" x2="200" y2="500" />
                  <line x1="300" y1="0" x2="300" y2="500" />
                </g>

                {/* Bombay pin */}
                <g transform="translate(135, 290)" opacity="0.5">
                  <circle r="5" fill="#181210" />
                  <text
                    x="12"
                    y="4"
                    fontFamily="JetBrains Mono"
                    fontSize="11"
                    fill="#181210"
                    letterSpacing="1"
                  >
                    BOMBAY
                  </text>
                  <text
                    x="12"
                    y="18"
                    fontFamily="JetBrains Mono"
                    fontSize="8"
                    fill="#6E6155"
                    letterSpacing="1"
                  >
                    Q3 2026
                  </text>
                </g>
                {/* Delhi pin */}
                <g transform="translate(175, 130)" opacity="0.5">
                  <circle r="5" fill="#181210" />
                  <text
                    x="12"
                    y="4"
                    fontFamily="JetBrains Mono"
                    fontSize="11"
                    fill="#181210"
                    letterSpacing="1"
                  >
                    DELHI
                  </text>
                  <text
                    x="12"
                    y="18"
                    fontFamily="JetBrains Mono"
                    fontSize="8"
                    fill="#6E6155"
                    letterSpacing="1"
                  >
                    Q4 2026
                  </text>
                </g>
                {/* Goa pin */}
                <g transform="translate(150, 345)" opacity="0.5">
                  <circle r="5" fill="#181210" />
                  <text
                    x="12"
                    y="4"
                    fontFamily="JetBrains Mono"
                    fontSize="11"
                    fill="#181210"
                    letterSpacing="1"
                  >
                    GOA
                  </text>
                  <text
                    x="12"
                    y="18"
                    fontFamily="JetBrains Mono"
                    fontSize="8"
                    fill="#6E6155"
                    letterSpacing="1"
                  >
                    2027
                  </text>
                </g>

                {/* Bangalore pin - live */}
                <g transform="translate(180, 380)">
                  <circle r="14" fill="#B8412C" opacity="0.2">
                    <animate
                      attributeName="r"
                      values="14;22;14"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.3;0;0.3"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    r="7"
                    fill="#B8412C"
                    stroke="#181210"
                    strokeWidth="1.5"
                  />
                  <circle r="2.5" fill="#FBF6E9" />
                  <text
                    x="16"
                    y="2"
                    fontFamily="Fraunces"
                    fontStyle="italic"
                    fontSize="18"
                    fill="#B8412C"
                    fontWeight="500"
                  >
                    Bangalore
                  </text>
                  <text
                    x="16"
                    y="18"
                    fontFamily="JetBrains Mono"
                    fontSize="9"
                    fill="#B8412C"
                    letterSpacing="2"
                  >
                    LIVE NOW
                  </text>
                </g>
              </svg>

              <div className={s.stamp}>
                <div>
                  Issue
                  <br />
                  <span className={s.stampBold}>01</span>
                  <br />
                  Bangalore
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========== CLOSER =========== */}
      <section className={s.closer}>
        <div className={s.wrap}>
          <div className={cn(s.closerPre, s.eyebrow)}>
            &mdash; Page 05 &mdash; Last word
          </div>
          <h2 className={s.closerTitle}>
            Your taste,
            <br />
            <em className={s.closerTitleEm}>worth recommending.</em>
          </h2>
          <p className={s.closerSub}>
            Two minutes to build. A lifetime to add to. The first list is the
            hardest. Promise.
          </p>
          <div className={s.closerCta}>
            <Link href="/sign-up" className={cn(s.btn, s.btnRust)}>
              Create your first list <span className={s.arrow}>&rarr;</span>
            </Link>
            <Link href="/explore" className={cn(s.btn, s.btnGhost)}>
              Explore Bangalore lists
            </Link>
          </div>
          <div className={s.closerSeal}>
            <div>
              Stamped
              <br />
              <span className={s.closerSealBold}>Bangalore</span>
              <br />
              2026
            </div>
          </div>
        </div>
      </section>

      {/* =========== FOOTER =========== */}
      <footer className={s.footer}>
        <div className={s.wrap}>
          <div className={s.footerGrid}>
            <div>
              <div className={s.colophon}>
                vouch &mdash;{" "}
                <em className={s.colophonEm}>a home for taste.</em>
              </div>
              <p className={s.footerColDesc}>
                Curated lists of places worth recommending. Built in Bangalore,
                for the cities we love.
              </p>
            </div>
            <div>
              <h6 className={s.footerH6}>Product</h6>
              <ul className={s.footerUl}>
                <li className={s.footerLi}>
                  <Link href="/explore" className={s.footerLink}>
                    Explore lists
                  </Link>
                </li>
                <li className={s.footerLi}>
                  <Link href="/sign-up" className={s.footerLink}>
                    Create a list
                  </Link>
                </li>
                <li className={s.footerLi}>
                  <Link href="/explore" className={s.footerLink}>
                    Browse curators
                  </Link>
                </li>
                <li className={s.footerLi}>
                  <a href="#" className={s.footerLink}>
                    For business
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h6 className={s.footerH6}>Cities</h6>
              <ul className={s.footerUl}>
                <li className={s.footerLi}>
                  <a href="#" className={s.footerLink}>
                    Bangalore{" "}
                    <span className={s.footerLiveTag}>&middot; live</span>
                  </a>
                </li>
                <li className={s.footerLi}>
                  <a href="#" className={s.footerLink}>
                    Bombay{" "}
                    <span className={s.footerSoonTag}>&middot; soon</span>
                  </a>
                </li>
                <li className={s.footerLi}>
                  <a href="#" className={s.footerLink}>
                    Delhi{" "}
                    <span className={s.footerSoonTag}>&middot; soon</span>
                  </a>
                </li>
                <li className={s.footerLi}>
                  <a href="#" className={s.footerLink}>
                    Goa{" "}
                    <span className={s.footerSoonTag}>&middot; &rsquo;27</span>
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h6 className={s.footerH6}>Colophon</h6>
              <ul className={s.footerUl}>
                <li className={s.footerLi}>
                  <a href="#" className={s.footerLink}>
                    About
                  </a>
                </li>
                <li className={s.footerLi}>
                  <a href="#" className={s.footerLink}>
                    Twitter / X
                  </a>
                </li>
                <li className={s.footerLi}>
                  <a href="#" className={s.footerLink}>
                    Instagram
                  </a>
                </li>
                <li className={s.footerLi}>
                  <a href="#" className={s.footerLink}>
                    Terms &middot; Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className={s.footerBottom}>
            <div className={s.footerLmark}>
              <span className={s.footerLmarkSeal}>V</span> Vouch &middot; Issue
              01 &middot; Vol. 01 &middot; 2026
            </div>
            <div>
              Set in Fraunces &amp; Instrument Sans &middot; Made with care in
              Bangalore
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
