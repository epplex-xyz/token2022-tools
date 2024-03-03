"use client";

import { useRedeemMutation } from "@/hooks/useRedeemMutation";
import styles from "./RedeemForm.module.css";
import { useWallet } from "@solana/wallet-adapter-react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { useMemo } from "react";

type RedeemFormInputs = {
  minter: string;
  burnables: Array<{ address: string }>;
};

export function RedeemForm() {
  const { publicKey } = useWallet();
  const {
    getValues,
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RedeemFormInputs>({
    defaultValues: {
      burnables: [],
    },
  });

  const { fields, append, prepend, remove, swap, move, insert } =
    useFieldArray<RedeemFormInputs>({
      control, // control props comes from useForm (optional: if you are using FormContext)
      name: "burnables", // unique name for your Field Array
    });

  const mutation = useRedeemMutation();

  const buttonLabel = useMemo(() => {
    if (mutation.isPending) {
      return "Loading";
    }
    return `Redeem ${fields.length} item(s)`;
  }, [mutation, fields]);

  const onSubmit: SubmitHandler<RedeemFormInputs> = (data) => {
    mutation.mutate({
      burnables: data.burnables.map(({address}) => address),
    });
  };


  if (Object.keys(errors).length) {
    console.log("form errors", errors);
  }

  return (
    <form className={styles["form"]} onSubmit={handleSubmit(onSubmit)}>
      <label>Wallet address</label>
      <input
        className={styles["input"]}
        {...register("minter", {
          required: true,
          value: publicKey?.toBase58(),
        })}
        disabled
      />
      <label>Burn address</label>

      {fields.map((field, index) => (
        <div className={styles["input-row"]} key={field.id}>
          <input
            className={styles["input"]}
            {...register(`burnables.${index}.address`, { required: true })}
          />
          <button
            className={styles["btn-primary"]}
            type="button"
            onClick={() => remove(index)}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        className={styles["btn-primary"]}
        type="button"
        onClick={() => append({ address: "" })}
      >
        Add burnable
      </button>
      <button
        className={styles["btn-primary"]}
        type="submit"
        disabled={mutation.isPending}
      >
        {buttonLabel}
      </button>
      {/* {errors.burnables && (
        <span className={styles["input-error"]}>Burn address is required</span>
      )} */}
      {Boolean(Object.keys(errors).length) && (
        <span className={styles["input-error"]}>Form errors, check console.</span>
      )}
    </form>
  );
}
