export const handleZodError = (error, res) => {
  // Pour que zod puisse utiliser .errors
  
  const zodErrors = error.issues || error.errors || [];
  const errors = zodErrors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
  
  return res.status(400).json({
    errors: errors,
  });
};