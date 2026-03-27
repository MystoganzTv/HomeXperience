"use client";

import { useMemo, useState } from "react";
import type { PropertyDefinition } from "@/lib/types";
import { WorkspaceSelect } from "@/components/workspace-select";

function findProperty(
  properties: PropertyDefinition[],
  propertyName: string,
) {
  return properties.find(
    (property) => property.name.toLowerCase() === propertyName.trim().toLowerCase(),
  );
}

export function PropertyUnitFieldGroup({
  properties,
  initialPropertyName = "",
  initialUnitName = "",
  propertyInputName = "propertyName",
  unitInputName = "unitName",
}: {
  properties: PropertyDefinition[];
  initialPropertyName?: string;
  initialUnitName?: string;
  propertyInputName?: string;
  unitInputName?: string;
}) {
  const [propertyName, setPropertyName] = useState(
    initialPropertyName || (properties.length === 1 ? properties[0].name : ""),
  );
  const [unitName, setUnitName] = useState(initialUnitName);

  const selectedProperty = useMemo(
    () => findProperty(properties, propertyName),
    [properties, propertyName],
  );
  const units = selectedProperty?.units ?? [];
  const propertyOptions = properties.map((property) => ({
    value: property.name,
    label: property.name,
    description: property.units.length > 0 ? `${property.units.length} saved units` : "Single-home property",
  }));
  const unitOptions = [
    { value: "", label: "No unit", description: "Use this for a single-home property." },
    ...units.map((unit) => ({
      value: unit.name,
      label: unit.name,
    })),
  ];

  return (
    <>
      <WorkspaceSelect
        className="sm:col-span-2"
        label="Property"
        name={propertyInputName}
        required
        disabled={properties.length === 0}
        value={propertyName}
        onChange={(nextProperty) => {
          setPropertyName(nextProperty);

          const nextSelectedProperty = findProperty(properties, nextProperty);
          if (
            nextSelectedProperty &&
            unitName &&
            !nextSelectedProperty.units.some(
              (unit) => unit.name.toLowerCase() === unitName.trim().toLowerCase(),
            )
          ) {
            setUnitName("");
          }
        }}
        options={propertyOptions}
        placeholder={properties.length > 0 ? "Select a property" : "Create a property first"}
      />

      <WorkspaceSelect
        className="sm:col-span-2"
        label="Unit"
        name={unitInputName}
        value={unitName}
        onChange={setUnitName}
        options={unitOptions}
        placeholder={units.length > 0 ? "Select a unit" : "No unit"}
        helper={
          selectedProperty
            ? units.length > 0
              ? "This property already has saved units you can reuse."
              : "This property has no saved units yet. Keep `No unit` for the full-home flow."
            : properties.length > 0
              ? "Units are optional. Keep `No unit` for single-home properties."
              : "Create your first property before adding bookings or expenses."
        }
      />
    </>
  );
}
