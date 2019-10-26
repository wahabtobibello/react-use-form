import { useState } from 'react';

export const useForm = ({
  initialValues = {},
  onSubmit,
  validate = {},
  normalize = {},
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event) => {
    if (event) event.preventDefault();
    let hasError = false;
    const nextErrors = {};
    Object.keys(values)
      .forEach((name) => {
        const validatorFns = validate[name];
        if (!validatorFns || !validatorFns.length) {
          return;
        }
        let error;
        validatorFns.forEach((validatorFn) => {
          error = validatorFn(values[name]);
          if (error) {
            hasError = true;
            nextErrors[name] = error;
          }
        });
      });
    if (!hasError) {
      setErrors({});
      setSubmitting(true);
      Promise.resolve(onSubmit(values))
        .then(() => {
          setSubmitting(false);
        })
        .catch(() => {
          setSubmitting(false);
        });
    } else {
      setErrors(nextErrors);
    }
  };

  const handleChange = (name, value) => {
    const normalizeFn = normalize[name];
    setValues((_values) => ({
      ..._values,
      [name]: normalizeFn ? normalizeFn(value) : value,
    }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setSubmitting(false);
  };
  const bind = {
    input: (name) => {
      if (!(name in values)) {
        setValues((_values) => ({
          ..._values,
          [name]: '',
        }));
      }
      return {
        name,
        value: values[name],
        onChange: (value) => handleChange(name, value),
        meta: {
          error: errors[name],
        },
      };
    },
    submit: () => ({
      type: 'submit',
      disabled: submitting,
    }),
    form: () => ({
      onSubmit: handleSubmit,
    }),
  };

  return {
    bind,
    values,
    errors,
    submitting,
    handleChange,
    handleSubmit,
    reset
  };
};