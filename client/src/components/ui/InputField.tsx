import type { InputFieldProps, SelectOptionProps } from "../../types";

const InputField = ({
  label,
  id,
  type,
  register,
  error,
  unit,
  currencyPrefix,
}: InputFieldProps) => {
  return (
    <>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 mb-1.5"
      >
        {label}
      </label>
      <div className="flex">
        {currencyPrefix ? (
          <div className="flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 px-3 text-xs font-semibold text-slate-600">
            {currencyPrefix}
          </div>
        ) : null}

        <input
          type={type}
          id={id}
          {...register}
          className={`w-full ${currencyPrefix ? "rounded-r-lg" : !currencyPrefix && !unit ? "rounded-lg" : "rounded-l-lg"} border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                      hover:border-slate-400`}
        />

        {unit ? (
          <div className="flex items-center rounded-r-lg border border-l-0 border-slate-300 bg-slate-100 px-3 text-xs font-semibold text-slate-600">
            {unit}
          </div>
        ) : null}
      </div>
      {error && <small className="text-red-500 text-xs">{error.message}</small>}
    </>
  );
};

const SelectOption = ({
  id,
  label,
  register,
  error,
  options,
}: SelectOptionProps) => {
  return (
    <>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 mb-1.5"
      >
        {label}
      </label>
      <select
        id={id}
        {...register}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-400 cursor-pointer"
      >
        {options.map((option) => (
          <option value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <small className="text-red-500 text-xs">{error.message}</small>}
    </>
  );
};

export { InputField, SelectOption };
