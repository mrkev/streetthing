import { useSelector } from "@legendapp/state/react";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { geoUrl } from "./App";
import { DataModel } from "./DataModel";
import Typography from "@mui/joy/Typography";

export function AppGame({ dataModel }: { dataModel: DataModel }) {
  (window as any).dataModel = dataModel;
  const styles = useStyles();
  const numGuessed = useSelector(dataModel.totalGuesses);
  const guessedList = dataModel.allGuessed;
  const guessedMap = dataModel.guessed;

  if (dataModel == null) {
    return <div>cargando...</div>;
  }

  return (
    <>
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        projectionConfig={{
          rotate: [100, -24, 0],
          scale: 1420,
        }}
        // style={{}}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const isMexico = geo.properties.geounit === "Mexico";
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isMexico ? "#EAEAEC" : "#242424"}
                  stroke={isMexico ? "#D6D6DA" : "#86868A"}
                />
              );
            })
          }
        </Geographies>
        {[...guessedList].map((feature) => {
          const place = feature.properties.place;
          const size =
            place === "city"
              ? 6
              : place === "town"
              ? 4
              : place == "village"
              ? 2.5
              : 2;

          return (
            <Marker
              onClick={() => {
                console.log(feature);
                const coord = feature.geometry.coordinates;
                const zoom =
                  place === "hamlet" || place === "village" ? 15 : 13;

                window.open(
                  `https://www.openstreetmap.org/#map=${zoom}/${coord[1]}/${coord[0]}&layers=N`,
                  "_blank"
                );

                // const zoom =
                // place === "hamlet" ||
                // place === "village"
                //   ? 15
                //   : 12;
                // window.open(
                //   `https://www.google.com/maps/@${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]},${zoom}z`,
                //   "_blank"
                // );
              }}
              key={feature.id}
              coordinates={feature.geometry.coordinates as [number, number]}
            >
              <circle r={size} fill="#F00" stroke="#fff" strokeWidth={1.4} />
            </Marker>
          );
        })}
      </ComposableMap>

      <GuessInput dataModel={dataModel} />

      <div className={styles.sidebar}>
        <div>{((100 * numGuessed) / dataModel.features.size).toFixed(2)}%</div>
        {/* <div>del total de ciudades y localidades</div> */}
        {/* <div>progressbar</div> */}
        <Typography level="h1">{numGuessed} localidades</Typography>
        {[...guessedMap.entries()].map(([guessStr, vals]) => {
          return (
            <div key={guessStr}>
              {guessStr} ({vals.size})
            </div>
          );
        })}
        <button>{dataModel.features.size} total</button>
        <Button variant="solid">Hello world</Button>
        {/* {localidades.map((x) => {
          return (
            <div key={x.id} style={{ fontSize: 8 }}>
              {x.properties.name}
            </div>
          );
        })} */}
      </div>
    </>
  );
}

const useStyles = createUseStyles({
  sidebar: {
    background: "black",
    width: 850,
  },
  guessInput: {
    position: "absolute",
    top: 24,
    left: 24,
  },
});

function GuessInput({ dataModel }: { dataModel: DataModel }) {
  const styles = useStyles();
  const [guess, setGuess] = useState("");

  return (
    <Input
      placeholder="Adivina una ciudad"
      autoFocus
      onChange={(e) => setGuess(e.target.value)}
      value={guess}
      className={styles.guessInput}
      size="lg"
      variant="outlined"
      onKeyDown={(e) => {
        if (e.key == "Enter") {
          const accepted = dataModel.doGuess(guess);
          if (accepted) {
            setGuess("");
          }
        }
      }}
    />
  );
}
