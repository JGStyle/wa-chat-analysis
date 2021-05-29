import Head from "next/head";
import Image from "next/image";
import { Text, Button, Spacer } from "@geist-ui/react";
import { Doughnut } from "react-chartjs-2";
import styles from "../styles/Home.module.css";
import { data } from "browserslist";

export default function Home() {
  const data = {
    labels: ["Alisia", "Lukas", "Josef"],
    datasets: [
      {
        data: [400, 142, 121],
        backgroundColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
      },
    ],
  };
  return (
    <div className={styles.maincontainer}>
      <Text h1>Whatsapp chat group analysis</Text>
      <Text h3>Upload your group chat file here</Text>
      <Spacer y={1.5} />
      <input type="file" name="wafile" id="wafile" />
      <Spacer y={0.5} />

      <div className={styles.graph}>
        <Doughnut data={data} width={50} height={50} />
      </div>

      <Button type="success" auto>
        Start analyzation
      </Button>

      <Spacer y={3.5} />
      <footer>Made with Heart by JGS.</footer>
    </div>
  );
}
