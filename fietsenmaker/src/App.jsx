import { useState, lazy, Suspense } from "react";
import { KF } from "./styles/animations";
import { S } from "./styles/theme";
import { useProgress } from "./hooks/useProgress";
import WorldMap from "./components/WorldMap";
import Garage from "./components/Garage";
import MedalUnlock from "./components/MedalUnlock";
import { START_GAME } from "./data/debug";
import SpeechObserver from "./components/SpeechObserver";

const Woordenwiel  = lazy(() => import("./games/Woordenwiel"));
const Rekenrace    = lazy(() => import("./games/Rekenrace"));
const Letterbouwer = lazy(() => import("./games/Letterbouwer"));
const Rijmfiets    = lazy(() => import("./games/Rijmfiets"));
const Kleurenmixer = lazy(() => import("./games/Kleurenmixer"));
const Vormenrit    = lazy(() => import("./games/Vormenrit"));
const ZwaartekrachtSorteer = lazy(() => import("./games/ZwaartekrachtSorteer"));
const PlanetenPad  = lazy(() => import("./games/PlanetenPad"));
const RaketBrandstof = lazy(() => import("./games/RaketBrandstof"));
const SterrenVangen = lazy(() => import("./games/SterrenVangen"));
const RuimtePuzzel = lazy(() => import("./games/RuimtePuzzel"));
const BoomgaardLetters = lazy(() => import("./games/BoomgaardLetters"));
const DoolhofGame      = lazy(() => import("./games/Doolhof"));
const DierenTellen     = lazy(() => import("./games/DierenTellen"));
const OogstSorteren    = lazy(() => import("./games/OogstSorteren"));
const ZaadjesPlanten   = lazy(() => import("./games/ZaadjesPlanten"));
const Toneelstuk       = lazy(() => import("./games/Toneelstuk"));
const BabyVerzorgen    = lazy(() => import("./games/BabyVerzorgen"));
const FossielPuzzel    = lazy(() => import("./games/FossielPuzzel"));
const DinoMaten        = lazy(() => import("./games/DinoMaten"));
const VoetafdrukMatch  = lazy(() => import("./games/VoetafdrukMatch"));
const DinoEi           = lazy(() => import("./games/DinoEi"));
const BotjesGraven     = lazy(() => import("./games/BotjesGraven"));

function GameLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontSize: 48,
        animation: "bounce 1s infinite",
      }}
    >
      {"\ud83d\udeb2"}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState(START_GAME || "home");
  const [newMedals, setNewMedals] = useState([]);
  const { progress, addGameScore, totalStars, todayPlayed } = useProgress();

  const handleScore = (gameId) => (score) => {
    const unlocked = addGameScore(gameId, score);
    if (unlocked.length > 0) {
      setNewMedals(unlocked);
    }
  };

  return (
    <div style={S.app}>
      <style>{KF}</style>
      <SpeechObserver />

      {screen === "home" && (
        <WorldMap
          onSelect={setScreen}
          onGarage={() => setScreen("garage")}
          totalStars={totalStars}
          todayPlayed={todayPlayed}
        />
      )}
      {screen === "garage" && (
        <Garage progress={progress} onBack={() => setScreen("home")} />
      )}

      <Suspense fallback={<GameLoader />}>
        {screen === "woorden" && (
          <Woordenwiel onBack={() => setScreen("home")} onScore={handleScore("woorden")} />
        )}
        {screen === "rekenen" && (
          <Rekenrace onBack={() => setScreen("home")} onScore={handleScore("rekenen")} />
        )}
        {screen === "letters" && (
          <Letterbouwer onBack={() => setScreen("home")} onScore={handleScore("letters")} />
        )}
        {screen === "rijmen" && (
          <Rijmfiets onBack={() => setScreen("home")} onScore={handleScore("rijmen")} />
        )}
        {screen === "kleuren" && (
          <Kleurenmixer onBack={() => setScreen("home")} onScore={handleScore("kleuren")} />
        )}
        {screen === "vormen" && (
          <Vormenrit onBack={() => setScreen("home")} onScore={handleScore("vormen")} />
        )}
        {screen === "space_zwaartekracht" && (
          <ZwaartekrachtSorteer onBack={() => setScreen("home")} onScore={handleScore("space_zwaartekracht")} />
        )}
        {screen === "space_planeten" && (
          <PlanetenPad onBack={() => setScreen("home")} onScore={handleScore("space_planeten")} />
        )}
        {screen === "space_brandstof" && (
          <RaketBrandstof onBack={() => setScreen("home")} onScore={handleScore("space_brandstof")} />
        )}
        {screen === "space_sterren" && (
          <SterrenVangen onBack={() => setScreen("home")} onScore={handleScore("space_sterren")} />
        )}
        {screen === "space_puzzel" && (
          <RuimtePuzzel onBack={() => setScreen("home")} onScore={handleScore("space_puzzel")} />
        )}
        {screen === "farm_boomgaard" && (
          <BoomgaardLetters onBack={() => setScreen("home")} onScore={handleScore("farm_boomgaard")} />
        )}
        {screen === "farm_doolhof" && (
          <DoolhofGame onBack={() => setScreen("home")} onScore={handleScore("farm_doolhof")} />
        )}
        {screen === "farm_dieren" && (
          <DierenTellen onBack={() => setScreen("home")} onScore={handleScore("farm_dieren")} />
        )}
        {screen === "farm_oogst" && (
          <OogstSorteren onBack={() => setScreen("home")} onScore={handleScore("farm_oogst")} />
        )}
        {screen === "farm_zaadjes" && (
          <ZaadjesPlanten onBack={() => setScreen("home")} onScore={handleScore("farm_zaadjes")} />
        )}
        {screen === "theater" && (
          <Toneelstuk onBack={() => setScreen("home")} onScore={handleScore("theater")} />
        )}
        {screen === "kinderopvang" && (
          <BabyVerzorgen onBack={() => setScreen("home")} onScore={handleScore("kinderopvang")} />
        )}
        {screen === "dino_fossiel" && (
          <FossielPuzzel onBack={() => setScreen("home")} onScore={handleScore("dino_fossiel")} />
        )}
        {screen === "dino_maten" && (
          <DinoMaten onBack={() => setScreen("home")} onScore={handleScore("dino_maten")} />
        )}
        {screen === "dino_voetafdruk" && (
          <VoetafdrukMatch onBack={() => setScreen("home")} onScore={handleScore("dino_voetafdruk")} />
        )}
        {screen === "dino_ei" && (
          <DinoEi onBack={() => setScreen("home")} onScore={handleScore("dino_ei")} />
        )}
        {screen === "dino_graven" && (
          <BotjesGraven onBack={() => setScreen("home")} onScore={handleScore("dino_graven")} />
        )}
      </Suspense>

      <MedalUnlock medals={newMedals} onDismiss={() => setNewMedals([])} />
    </div>
  );
}
