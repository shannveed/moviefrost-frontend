export const Message = ({ label, placeholder, register, name, id }) => {
  return (
    <div className="text-sm above-1000:text-xs w-full">
      <label htmlFor={id || name} className="text-border font-semibold">
        {label}
      </label>
      <textarea
        id={id || name}
        className="w-full h-40 above-1000:h-32 mt-2 p-6 above-1000:p-4 bg-main border border-border rounded text-sm above-1000:text-xs"
        placeholder={placeholder}
        {...register}
        name={name}
      ></textarea>
    </div>
  );
};

export const Select = ({ label, options, register, name, id }) => {
  return (
    <div className="text-sm above-1000:text-xs w-full">
      <label htmlFor={id || name} className="text-border font-semibold">
        {label}
      </label>
      <select
        id={id || name}
        className="w-full mt-2 px-6 py-4 above-1000:px-4 above-1000:py-3 text-white bg-main border border-border rounded text-sm above-1000:text-xs"
        {...register}
        name={name}
      >
        {options.map((o, i) => (
          <option key={i} value={o.value}>
            {o.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export const Input = ({
  label,
  placeholder,
  type,
  bg,
  register,
  name,
  value,
  onChange,
  id,
}) => {
  return (
    <div className="text-sm above-1000:text-xs w-full">
      <label htmlFor={id || name} className="text-border font-semibold">
        {label}
      </label>
      <input
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        {...register}
        type={type}
        placeholder={placeholder}
        className={`w-full text-sm above-1000:text-xs mt-1 mb-2 p-4 above-1000:p-3 border border-border rounded text-white ${
          bg ? 'bg-main' : 'bg-dry'
        }`}
      />
    </div>
  );
};
