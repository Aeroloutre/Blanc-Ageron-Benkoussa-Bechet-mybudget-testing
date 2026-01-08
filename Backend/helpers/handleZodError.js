export const handleZodError = (error, res) => {
  const errors = error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
  
  return res.status(400).json({
    error: "Erreur lors de la validation des paramètres",
    details: errors,
  });
};