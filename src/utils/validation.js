export const phoneValidationRule = {
  validator: (_, value) => {
    const phoneRegex = /^\+?[\d\s()-]{8,30}$/;
    if (!value || phoneRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Numărul de telefon nu este valid."));
  },
};
