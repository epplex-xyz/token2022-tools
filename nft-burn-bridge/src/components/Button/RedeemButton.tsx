'use client';

import styles from "./RedeemButton.module.css";

export function RedeemButton() {
  const onClick = () => {
    fetch("/api/redeem", {
      method: "POST",
    });
  };
  return (
    <button className={styles["btn-primary"]} onClick={onClick}>
      Redeem
    </button>
  );
}
