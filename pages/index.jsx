import { Text, Spacer, Progress } from "@geist-ui/react";
import { CheckInCircleFill } from "@geist-ui/react-icons"
import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import styles from "../styles/Home.module.css";
const whatsapp = require("whatsapp-chat-parser")

export default function Home() {
  const [progress, setProgress] = useState(0)
  const [analyseProgress, setAnalyseProgress] = useState(0)

  const [displayAll, setDisplayAll] = useState(false);

  const [totalMessages, setTotalMessages] = useState(0)
  const [mostMessagesCount, setMostMessagesCount] = useState(0)
  const [mostMessagesAuthor, setMostMessagesAuthor] = useState("")
  const [countData, setCountData] = useState({});


  function processData(content) {
    let zip = (...a) => a[0].map((_, n) => a.map((b) => b[n]));
    whatsapp.parseString(content)
    .then(messages => {
      setAnalyseProgress(100);
      setTotalMessages(messages.length)
      const dataPreset = {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [
              "#4dc9f6",
              "#f67019",
              "#f53794",
              "#537bc4",
              "#acc236",
              "#166a8f",
              "#00a950",
              "#58595b",
              "#8549ba",
            ],
          },
        ],
      };
      // ANALISE AMOUNT OF TOTAL MESSAGES
      let countdata = JSON.parse(JSON.stringify(dataPreset));
      for (let i = 0; i < messages.length; i++) {
        let message = messages[i];
        // ANALISE AMOUNT OF TOTAL MESSAGES
        if (countdata.labels.includes(message.author)) {
          console.log("true");
          const index = countdata.labels.indexOf(message.author);
          countdata.datasets[0].data[index] += 1;
        } else {
          countdata.labels.push(message.author);
          countdata.datasets[0].data.push(1);
        }
      }

      let labels = countdata.labels;
      let data = countdata.datasets[0].data;

      [labels, data] = zip(...zip(labels, data).sort((x, y) => y[1] - x[1]));

      countdata.labels = labels;
      countdata.datasets[0].data = data;
      setMostMessagesAuthor(labels[0])
      setMostMessagesCount(data[0])
      setCountData(countdata);

      setDisplayAll(true);
    })
    .catch(err => {
      console.log(err)
    })
  }

  useEffect(() => {
    const fileSelector = document.getElementById('wafile')
    fileSelector.addEventListener('change', (event) => {
      const file = event.target.files
      try {
        readFile(file[0])
      } catch(err) {
        console.log(err)
      } 
    })
  }, [])

  function readFile(path) {
    const reader = new FileReader()
    reader.addEventListener('load', (event) => {
      let res = event.target.result
      setProgress(100)
      processData(res)
    })
    reader.addEventListener('progress', (event) => {
      if (event.loaded && event.total) {
        setProgress(event.loaded/event.total *100)
      }
    });
    reader.readAsText(path)
    }

  return (
    <div className={styles.maincontainer}>
      <Text h1>Whatsapp chat analysis</Text>
      <Text h3>Upload your chat file here</Text>
      <Text h3>
        Analysis will start automatically once you select the file.
      </Text>
      <Spacer y={1.5} />

      <label for="wafile" className={styles.filelabel}>
        Choose your file →
      </label>
      <input
        type="file"
        name="wafile"
        id="wafile"
        size="80"
        className={styles.fileinput}
      />
      <Spacer y={0.5} />

      <Text h3>Read file {progress > 99 && <CheckInCircleFill />} </Text>
      <Progress value={progress} />
      <Spacer y={0.5} />

      <Text h3>
        Analise Data {analyseProgress > 99 && <CheckInCircleFill />}{" "}
      </Text>
      <Progress type="success" value={analyseProgress} />
      <Spacer y={0.5} />
      <hr className={styles.hr}/>
      {displayAll && ( ( (
        <div className={styles.maincontent}>
          <Text p>Out of all {totalMessages} messages → with {mostMessagesCount} messages, {mostMessagesAuthor} sent the most messages making up for {Math.floor(mostMessagesCount/totalMessages *100)}%.</Text>
          <div className={styles.graph}>
            <Doughnut data={countData} width={50} height={50} />
          </div>
        </div>
      )))}
      <footer className={styles.footer}>Made with Heart by JGS.</footer>
    </div>
  );
}
