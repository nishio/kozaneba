export const addTooltip = (
  children: JSX.Element,
  text: string,
  testid: string
) => {
  return (
    <span className="tooltip" style={{ margin: "5px" }}>
      {children}
      <span className="tooltiptext" data-testid={testid}>
        {text}
      </span>
    </span>
  );
};
