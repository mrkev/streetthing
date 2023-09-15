import { observablePrimitive } from "@legendapp/state";
import type { Feature, FeatureCollection, Point } from "@types/geojson";
import { normalizeString, aliasesForName } from "./normalization";
import { nullthrows } from "./nullthrows";

type FeatureProperties = {
  name: string;
  "@id": string;
  place: "city" | "town" | "village" | "hamlet";
};
type StandardFeature = Feature<Point, FeatureProperties> & { id: string };

// 0 continent, 1 country. todo: need 2 state, 3 etc?
function deduceSpecificity(str: string) {
  if (str.includes("america")) {
    return 0;
  } else if (str === "mexico") {
    return 1;
  } else {
    return 2;
  }
}

export class DataModel {
  // id => feature
  readonly features: Map<string, StandardFeature>;
  // name => feature
  readonly guessableByAlias: Map<string, Set<StandardFeature>>;
  // guess string => all the features that guess guessed
  readonly guessed: Map<string, Set<StandardFeature>>;

  readonly totalGuesses = observablePrimitive(0);
  readonly allGuessed = new Set<StandardFeature>();

  constructor(allData: FeatureCollection<Point>) {
    this.features = DataModel.verifiedFeatures(allData);
    this.guessableByAlias = DataModel.createAliasMap(this.features);
    this.guessed = new Map();
  }

  doGuess(str: string) {
    const normalized = normalizeString(str);
    const hits = this.guessableByAlias.get(normalized);
    if (hits == null) {
      return false;
    }
    this.guessed.set(str, hits);
    this.totalGuesses.set(this.totalGuesses.get() + hits.size);
    for (const hit of hits) {
      this.allGuessed.add(hit);
    }
    return true;
  }

  static verifiedFeatures(
    allData: FeatureCollection<Point>
  ): Map<string, StandardFeature> {
    const map = new Map();

    for (const feature of allData.features as StandardFeature[]) {
      if (feature.id == null) {
        console.log("no id", feature);
        continue;
      }
      if (feature.properties == null) {
        console.log("no properites", feature);
        continue;
      }
      if (feature.properties["@id"] == null) {
        console.log("no properites.@id", feature);
        continue;
      }
      if (feature.properties.name == null) {
        console.log("no properites.name", feature);
        continue;
      }
      // if (typeof feature.properties.is_in === "string") {
      //   const isIn = feature.properties.is_in
      //     .split(",")
      //     .flatMap((x) => x.split(";"))
      //     .map(normalizeString)
      //     .reverse();

      //   const firstSpec = deduceSpecificity(isIn[0]);
      //   if (firstSpec + isIn.length >= 4) {
      //     return false;
      //   }
      // }

      if (
        feature.properties.place === "village" ||
        feature.properties.place === "hamlet"
      ) {
        if (Object.keys(feature.properties).length >= 4) {
          continue;
        }
      }

      const id = nullthrows(feature.id, "feature has no id");
      if (map.has(id)) {
        console.warn("duplicate ids", id, feature, map.get(id));
      }
      map.set(id, feature);
    }

    return map;
  }

  static createAliasMap(
    features: Map<string, StandardFeature>
  ): Map<string, Set<StandardFeature>> {
    const map = new Map<string, Set<StandardFeature>>();
    for (const feature of features.values()) {
      const normalizedName = normalizeString(feature.properties.name);
      const aliases = aliasesForName(normalizedName);
      for (const alias of aliases) {
        let set = map.get(alias);
        if (set == null) {
          set = new Set();
          map.set(alias, set);
        }
        set.add(feature);
      }
    }
    return map;
  }
}

// puntos
// capital: 5
// importante: 3
// con wiki: 3

// classificar por estado— 20 puntos si el estado al 50%
// historically important but obscure, popup, 2 points
