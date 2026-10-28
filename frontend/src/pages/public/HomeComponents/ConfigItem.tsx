import React from "react";

export default function ConfigItem({ label, value }: any) {

  return (

    <div className="flex justify-between py-1">

      <span className="text-gray-500">
        {label}
      </span>

      <span className="font-medium">
        {value ?? "-"}
      </span>

    </div>

  );

}