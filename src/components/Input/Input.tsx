/* eslint-disable no-empty-pattern */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type

import { ChangeEvent } from "react";

export type InputProps = {
  variable: string;
  onChange: ChangeEvent<HTMLInputElement>;
  value?: number;
};

const Input: React.FC<InputProps> = ({ onChange, variable, value }) => {
  return (
    <div className="flex items-center h-full">
      <input
        className="block w-10 h-full rounded-l-lg p-2 font-semibold text-gray-200 bg-white bg-opacity-25"
        type="number"
        value={value}
        onChange={onChange}
      />
      <div className="flex items-center h-full rounded-r-lg bg-white bg-opacity-80">
        <p className="px-2 font-medium text-neutral-800">{variable}</p>
      </div>
    </div>
  );
};

export default Input;
