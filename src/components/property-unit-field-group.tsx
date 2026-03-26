"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { PropertyDefinition } from "@/lib/types";

function inputClassName() {
  return "input-surface w-full rounded-2xl px-4 py-3 text-sm";
}

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
  const [propertyName, setPropertyName] = useState(initialPropertyName);
  const [unitName, setUnitName] = useState(initialUnitName);
  const propertyListId = useId();
  const unitListId = useId();

  useEffect(() => {
    setPropertyName(initialPropertyName);
  }, [initialPropertyName]);

  useEffect(() => {
    setUnitName(initialUnitName);
  }, [initialUnitName]);

  const selectedProperty = useMemo(
    () => findProperty(properties, propertyName),
    [properties, propertyName],
  );
  const units = selectedProperty?.units ?? [];

  return (
    <>
      <label className="space-y-2 sm:col-span-2">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          Property
        </span>
        <input
          className={inputClassName()}
          type="text"
          name={propertyInputName}
          list={propertyListId}
          required
          value={propertyName}
          onChange={(event) => {
            const nextProperty = event.target.value;
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
          placeholder={
            properties.length > 0 ? "Pick or type a property" : "Create a property first"
          }
        />
        <datalist id={propertyListId}>
          {properties.map((property) => (
            <option key={property.id ?? property.name} value={property.name} />
          ))}
        </datalist>
      </label>

      <label className="space-y-2 sm:col-span-2">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          Unit
        </span>
        <input
          className={inputClassName()}
          type="text"
          name={unitInputName}
          list={units.length > 0 ? unitListId : undefined}
          value={unitName}
          onChange={(event) => setUnitName(event.target.value)}
          placeholder={
            units.length > 0
              ? "Pick or type a unit"
              : "No unit, room, apartment..."
          }
        />
        {units.length > 0 ? (
          <datalist id={unitListId}>
            {units.map((unit) => (
              <option key={unit.id ?? unit.name} value={unit.name} />
            ))}
          </datalist>
        ) : null}
        <p className="text-xs text-slate-500">
          {selectedProperty
            ? units.length > 0
              ? "This property already has saved units you can reuse."
              : "This property has no units yet. Leave blank or add one in Properties."
            : properties.length > 0
              ? "Units are optional. You can leave this blank for single-home properties."
              : "Create your first property before adding bookings or expenses."}
        </p>
      </label>
    </>
  );
}
