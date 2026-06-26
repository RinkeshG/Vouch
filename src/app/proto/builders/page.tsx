import c from "./builders.module.css";

const TILE = "https://a.basemaps.cartocdn.com/light_all/12/2931/1899@2x.png";

/* A — edit the live page itself (direct / WYSIWYG) */
function PhoneA() {
  return (
    <div className={c.phone}><div className={c.screen}>
      <div className={c.bar}>
        <span className={c.brand}><span className={c.dot} />Hotlist</span>
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}><span className={c.draftPill}>Draft</span><span className={c.pubMini}>Publish</span></span>
      </div>
      <div className={c.scroll}>
        <div className={c.aCover}>
          <div className={c.aCoverImg} style={{ backgroundImage: `url("${TILE}")` }} />
          <span className={c.aPin} style={{ top: "44%", left: "30%" }} />
          <span className={c.aPin} style={{ top: "34%", left: "62%" }} />
          <span className={c.aPin} style={{ top: "62%", left: "52%" }} />
        </div>
        <div className={c.aTitle}>Where I send people<span className={c.aCaret} /></div>
        <div className={c.aWho}>you · hotlist.to/you</div>
        <div className={c.aItem}>
          <span className={c.aGrip}>⠿</span>
          <span><span className={c.aName}>Blue Tokai</span> <span className={c.aArea}>· Koramangala</span><br /><span className={c.aTake}>the cold brew that ruined all others</span></span>
        </div>
        <div className={c.aItem}>
          <span className={c.aGrip}>⠿</span>
          <span><span className={c.aName}>Toit</span> <span className={c.aArea}>· Indiranagar</span><br /><span className={c.aTake}>weekday only. the toit weiss</span></span>
        </div>
        <div className={c.aAdd}><span className={c.aPlus}>+</span> add a spot</div>
      </div>
    </div></div>
  );
}

/* B — one spot at a time (composer flow) */
function PhoneB() {
  return (
    <div className={c.phone}><div className={`${c.screen} ${c.bScreen}`}>
      <div className={c.bar}>
        <span className={c.brand}><span className={c.dot} />Hotlist</span>
        <span className={c.draftPill}>save &amp; exit</span>
      </div>
      <div className={c.scroll} style={{ display: "flex", flexDirection: "column" }}>
        <div className={c.bProg}><span>building</span><span className={c.bProgBar}><span className={c.bProgFill} /></span><span>3 spots</span></div>
        <div className={c.bAsk}>Why should they go?</div>
        <div className={c.bCard}>
          <span className={c.bChip}>Toit <span>· Indiranagar</span></span>
          <div className={c.bLabel}>your take</div>
          <div className={c.bTake}>weekday only. the toit weiss is the move<span className={c.bTakeCaret} /></div>
        </div>
        <div className={c.bStack}><i /><i /></div>
        <div className={c.bActions}>
          <span className={c.bPrimary}>Add another <span>+</span></span>
          <span className={c.bGhost}>done — see my page →</span>
        </div>
      </div>
    </div></div>
  );
}

/* C — assemble a tactile collection (zine / board) */
function PhoneC() {
  return (
    <div className={c.phone}><div className={`${c.screen} ${c.cScreen}`}>
      <div className={c.bar}>
        <span className={c.brand}><span className={c.dot} />Hotlist</span>
        <span className={c.pubMini}>Publish</span>
      </div>
      <div className={c.scroll}>
        <div className={c.cCover}>
          <span><span className={c.cCoverTitle}>Maya&rsquo;s<br />Bangalore</span><span className={c.cCoverBy}>by maya · est. you</span></span>
          <span className={c.cStamp}>BLR<br />✦<br />11</span>
        </div>
        <div className={c.cBoard}>
          <div className={c.cCard}><span className={c.cNum}>1</span><div className={c.cName}>Blue Tokai</div><div className={c.cTagRow}><span className={c.cTag}>Coffee</span><span className={c.cTag}>Koramangala</span></div><div className={c.cTake}>the cold brew that ruined all others</div></div>
          <div className={c.cCard}><span className={c.cNum}>2</span><div className={c.cName}>Toit</div><div className={c.cTagRow}><span className={c.cTag}>Beer</span><span className={c.cTag}>Indiranagar</span></div><div className={c.cTake}>weekday only. the toit weiss</div></div>
          <div className={c.cCard}><span className={c.cNum}>3</span><div className={c.cName}>Empire</div><div className={c.cTagRow}><span className={c.cTag}>Late night</span></div><div className={c.cTake}>ghee roast at 1am. don&rsquo;t think</div></div>
        </div>
        <span className={c.cPin}>+ pin a spot</span>
      </div>
    </div></div>
  );
}

export default function BuildersProto() {
  return (
    <main className={c.stage}>
      <div className={c.head}>
        <p className={c.kick}>direction study · the builder</p>
        <h1 className={c.h1}>Three ways to make a Hotlist.</h1>
        <p className={c.sub}>Same product, three philosophies of <em>how you build it</em> — each one shapes the whole app, not just this screen. Mobile-first, because that&rsquo;s where taste gets shared.</p>
      </div>
      <div className={c.row}>
        <div className={c.col}>
          <div className={c.colHead}><span className={c.colNum}>A</span><span className={c.colName}>Edit the page</span></div>
          <p className={c.colTag}>no form, no preview — the page is the editor</p>
          <PhoneA />
          <p className={c.colBody}>You&rsquo;re always looking at <b>your real page</b>. Tap the title to rename, tap a take to write it, drag the handle to reorder, tap <b>+ add a spot</b> to drop one in. What you make is what you see — the preview pane disappears because there&rsquo;s nothing to preview.</p>
          <p className={c.colDelight}><b>Delight:</b> a spot drops in with a soft settle; long-press lifts a card to drag; edit affordances melt away the instant you Publish — it just becomes live.</p>
        </div>
        <div className={c.col}>
          <div className={c.colHead}><span className={c.colNum}>B</span><span className={c.colName}>One spot at a time</span></div>
          <p className={c.colTag}>build it like a conversation</p>
          <PhoneB />
          <p className={c.colBody}>No blank form to stare at. It asks one thing at a time — <b>&ldquo;what&rsquo;s a place you&rsquo;d always send?&rdquo;</b> then <b>&ldquo;why?&rdquo;</b> — and each answer stacks into a deck. Kills the cold-start dread; perfect for thumbs; the whole app feels like a friendly nudge to share what you know.</p>
          <p className={c.colDelight}><b>Delight:</b> each finished spot flips onto a growing stack in your hand; the take is yours, handwritten; at the end the deck <b>fans out and assembles</b> into your page.</p>
        </div>
        <div className={c.col}>
          <div className={c.colHead}><span className={c.colNum}>C</span><span className={c.colName}>A collection you assemble</span></div>
          <p className={c.colTag}>a taste object — tactile, zine-like</p>
          <PhoneC />
          <p className={c.colBody}>Your Hotlist is a <b>thing you make</b>, not a doc you fill — place cards as tactile tickets with stamps and your handwriting, arranged on a warm spread. Leans all the way into the brag-worthy artifact. The public page is a designed zine; browsing others is flipping through their collections.</p>
          <p className={c.colDelight}><b>Delight:</b> cards drop with a slight rotation and settle; a rubber-stamp press on Publish; paper texture and marginalia. The most <b>&ldquo;I want to show people this&rdquo;</b> of the three.</p>
        </div>
      </div>
    </main>
  );
}
