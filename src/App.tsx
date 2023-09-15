import { observablePrimitive } from "@legendapp/state";
import { useSelector } from "@legendapp/state/react";
import "./App.css";
import jsonURL from "/allcities_mexico.geojson?url";
import { AppGame } from "./AppGame";
import { DataModel } from "./DataModel";

const state$ = observablePrimitive<DataModel | null>(null);

fetch(jsonURL)
  .then((res) => res.json())
  .then((json) => {
    state$.set(new DataModel(json));
  });

export const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/continents/north-america.json";

export function App() {
  const dataModel = useSelector(state$);

  if (dataModel == null) {
    return <div>cargando...</div>;
  }
  return <AppGame dataModel={dataModel} />;
}
