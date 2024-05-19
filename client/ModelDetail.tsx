import { useContext, useEffect, useState } from "react";
import type { Model } from "../global";
import { GlobalContext } from "./GlobalState";
import type { ModelDiffClient as ModelDiff } from "./client";
import {
  calcCostPerMillion,
  calcCostPerThousand,
  changeSnippet,
  dateStringDuration,
} from "./utils";

export const ModelDetail: React.FC = () => {
  const [model, setModel] = useState<Model | null>(null);
  const [changes, setChanges] = useState<ModelDiff[]>([]);
  const [removed, setRemoved] = useState<boolean>(false);
  const { globalStatus, globalData, setGlobalClient, setError } = useContext(GlobalContext);

  useEffect(() => {
    if (!globalStatus.isValid) {
      // No point in doing anything, if the data is not valid.
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (!id) {
      setError("No model ID provided.");
      return;
    }
    let foundModel: Model = globalData.models.find((obj: Model) => obj.id === id);
    if (!foundModel) {
      const removedModel: Model = globalData.removed.find((obj: Model) => obj.id === id);
      if (removedModel) {
        setRemoved(true);
        foundModel = removedModel;
      } else {
        setError("Unknown model ID.");
        return;
      }
    }
    setModel(foundModel);
    const foundChanges: ModelDiff[] = globalData.changes.filter((obj) => obj.id === id);
    setChanges(foundChanges);
  }, [globalData, globalStatus]);

  useEffect(() => {
    setGlobalClient((prevState) => ({
      ...prevState,
      navBarDynamicElement: (
        <>
          <span className="dynamic-element"></span>
        </>
      ),
    }));
  }, []);

  if (!model) {
    return <></>;
  }

  // Create a new object that hides the already shown 'description' property
  const modelDetails: any = { ...model };
  modelDetails["description"] = "[...]";

  const Changes = () => {
    if (changes.length > 0) {
      return (
        <>
          <h3>Changes</h3>
          {changes.map((change, index) => (
            <div key={index} className="change-entry">
              <p>
                {change.type} at {dateStringDuration(change.timestamp)}
              </p>
              {change.type === "added" ? "" : changeSnippet(change)}
            </div>
          ))}
        </>
      );
    } else {
      return <></>;
    }
  };

  const Price = () => {
    if (model.id === "openrouter/auto") {
      return (
        <>
          <p style={{ fontSize: "large" }}>
            <b>See model</b>
          </p>
        </>
      );
    }
    if (parseFloat(model.pricing.completion) > 0) {
      return (
        <>
          <p className="price-container" style={{ fontSize: "large" }}>
            {PriceElement("Input:", model.pricing.prompt, "tokens")}
            {PriceElement("Output:", model.pricing.completion, "tokens")}
            {PriceElement("Request:", model.pricing.request, "requests", true)}
            {PriceElement("Image:", model.pricing.image, "images", true)}
          </p>
        </>
      );
    }
    return (
      <>
        <p style={{ fontSize: "large", color: "green" }}>
          <b>Free</b>
        </p>
      </>
    );
  };

  const PriceElement = (
    prefix: string,
    price: string,
    unit: string,
    thousands: boolean = false
  ) => {
    if (parseFloat(price) > 0) {
      const formattedPrice = thousands
        ? calcCostPerThousand(price, unit)
        : calcCostPerMillion(price, unit);
      return (
        <>
          <span className={"price-prefix" + (removed ? " removed" : "")}>{prefix}</span>
          <b className={removed ? "removed" : ""}>{formattedPrice}</b>
        </>
      );
    }
  };

  return (
    <div className="model-details">
      <div className="model-details-col-container">
        <div>
          <h3>Price</h3>
          {Price()}
        </div>
        <div>
          <h2 className="model-details-model-name">{model.name + (removed ? " (removed)" : "")}</h2>
          <h4 className={removed ? "removed" : ""}>{model.id}</h4>
        </div>
        <div>
          <h3>Context Length</h3>
          <p
            className={removed ? "removed" : ""}
            style={{ fontSize: "x-large", textAlign: "center" }}
          >
            {model.context_length.toLocaleString()}
          </p>
        </div>
      </div>
      <h3>Description</h3>
      <pre>{model.description}</pre>
      <h3>Model Details</h3>
      <code>
        <pre>{JSON.stringify(modelDetails, null, 4)}</pre>
      </code>
      {Changes()}
    </div>
  );
};
