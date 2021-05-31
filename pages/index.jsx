import { Text, Spacer, Progress, Button, Checkbox } from "@geist-ui/react";
import { CheckInCircleFill } from "@geist-ui/react-icons"
import { useEffect, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import styles from "../styles/Home.module.css";
const whatsapp = require("whatsapp-chat-parser")

export default function Home() {
  const [file, setFile] = useState([])
  const [contacts, setContacts] = useState([])
  const [chooseContacts, setChooseContacts] = useState(false)
  const [limitedContacts, setLimitedContacts] = useState([]);

  const [progress, setProgress] = useState(0)
  const [analyseProgress, setAnalyseProgress] = useState(0)

  const [displayAll, setDisplayAll] = useState(false);

  // Block 1
  const [totalMessages, setTotalMessages] = useState(0)
  const [mostMessagesCount, setMostMessagesCount] = useState(0)
  const [mostMessagesAuthor, setMostMessagesAuthor] = useState("")
  const [countData, setCountData] = useState({});

  // Block 2
  const [totalWords, setTotalWords] = useState(0)
  const [averageWords, setAverageWords] = useState(0)
  const [averageWordsData, setAverageWordsData] = useState({})
  const [absoluteWordsData, setAbsoluteWordsData] = useState({})

  function processData(messages) {
    console.log(messages);
    let zip = (...a) => a[0].map((_, n) => a.map((b) => b[n]));
    setAnalyseProgress(100);
    setTotalMessages(messages.length);
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
    // ANALISE AMOUNT OF WORDS
    let worddata = JSON.parse(JSON.stringify(dataPreset));
    let absoluteworddata = JSON.parse(JSON.stringify(dataPreset));
    let totalwords = 0;
    let countwordspersonwiseAuthors = [];
    let countwordspersonwiseAmount = [];
    for (let i = 0; i < messages.length; i++) {
      let message = messages[i];
      // ANALISE AMOUNT OF TOTAL MESSAGES
      if (countdata.labels.includes(message.author)) {
        const index = countdata.labels.indexOf(message.author);
        countdata.datasets[0].data[index] += 1;
      } else {
        countdata.labels.push(message.author);
        countdata.datasets[0].data.push(1);
      }

      // ANALISE AMOUNT OF WORDS
      let amountwords = message.message.split(" ").length;
      totalwords += amountwords;
      if (countwordspersonwiseAuthors.includes(message.author)) {
        countwordspersonwiseAmount[
          countwordspersonwiseAuthors.indexOf(message.author)
        ] += amountwords;
      } else {
        countwordspersonwiseAuthors.push(message.author);
        countwordspersonwiseAmount.push(amountwords);
      }
    }

    // ANALISE AMOUNT OF TOTAL MESSAGES
    let labels = countdata.labels;
    let data = countdata.datasets[0].data;
    // INSERT ANALISYS OF WORDS
    absoluteworddata.labels = countwordspersonwiseAuthors
    countwordspersonwiseAmount.forEach(element => {
      absoluteworddata.datasets[0].data.push(element)
    });
    [absoluteworddata.labels, absoluteworddata.datasets[0].data] = zip(...zip(absoluteworddata.labels, absoluteworddata.datasets[0].data).sort((x, y) => y[1] - x[1]));
    setAbsoluteWordsData(absoluteworddata)
    for (let i = 0; i < countwordspersonwiseAmount.length; i++) {
      countwordspersonwiseAmount[i] = (
        countwordspersonwiseAmount[i] / data[i]
      ).toFixed(2);
    }
    // END INSERT
    [labels, data] = zip(...zip(labels, data).sort((x, y) => y[1] - x[1]));

    countdata.labels = labels;
    countdata.datasets[0].data = data;
    setMostMessagesAuthor(labels[0]);
    setMostMessagesCount(data[0]);
    setCountData(countdata);

    // ANALISE AMOUNT OF WORDS
    [countwordspersonwiseAuthors, countwordspersonwiseAmount] = zip(
      ...zip(countwordspersonwiseAuthors, countwordspersonwiseAmount).sort(
        (x, y) => y[1] - x[1]
      )
    );

    worddata.labels = countwordspersonwiseAuthors;
    worddata.datasets[0].data = countwordspersonwiseAmount;

    setAverageWordsData(worddata);
    setTotalWords(totalwords);
    setAverageWords((totalwords / messages.length).toPrecision(2));

    setDisplayAll(true);
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
      whatsapp.parseString(res)
      .then(messages => {
        setFile(messages)
        getContacts(messages)
        setChooseContacts(true)
      })
      .catch(err => {
        console.log(err)
      })
    })
    reader.addEventListener('progress', (event) => {
      if (event.loaded && event.total) {
        setProgress(event.loaded/event.total *100)
      }
    });
    reader.readAsText(path)
  }

  function getContacts(msgs) {
    let contacts = []
    for (let i = 0; i < msgs.length; i++) {
      let message = msgs[i]
      if(contacts.includes(message.author)) {
        continue
      }
      else {
        contacts.push(message.author)
      }
    }
    setContacts(contacts)
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }

  function initializeAnalyzation() {
    setChooseContacts(false);
    let data = file;
    let c = limitedContacts;
    for (let i = file.length - 1; i >= 0; i--) {
      const msg = file[i];
      if (!c.includes(msg.author)) {
        data.splice(i, 1);
      }
    }
    processData(data);
  }

  function contactshandler(value) {
    setLimitedContacts(value);
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
      <Spacer y={1.5} />
      {chooseContacts && (
        <div className={styles.contactcontainer}>
          <Text h3>Please choose all contacts to be included.</Text>
          <Text h4>(Uncheck groupname and System)</Text>
          <Checkbox.Group onChange={contactshandler} value={[]}>
            {contacts.map((contact, index) => (
              <Checkbox
                size="medium"
                key={index}
                value={contact}
                className={styles.block}
              >
                {contact}
              </Checkbox>
            ))}
          </Checkbox.Group>
          <Spacer y={1} />
          <Button shadow type="success" onClick={initializeAnalyzation}>
            I'm done.
          </Button>
          <Spacer y={0.5} />
        </div>
      )}

      {displayAll && (
        <div className={styles.maincontent}>
          <Text p>
            Out of all {totalMessages} messages → with {mostMessagesCount}{" "}
            messages, {mostMessagesAuthor} sent the most messages making up for{" "}
            {Math.floor((mostMessagesCount / totalMessages) * 100)}%.
          </Text>
          <div className={styles.graph}>
            <Doughnut data={countData} width={50} height={50} />
          </div>
          <Text p>
            On average, every message contained {averageWords} words. With{" "}
            {averageWordsData.datasets[0].data[0]} average words,{" "}
            {averageWordsData.labels[0]} uses the most words. In total,{" "}
            {totalWords} words were sent.
          </Text>
          <div className={styles.graph}>
            <Bar data={averageWordsData} width={50} height={50}></Bar>
          </div>
          <Text p>Total amount of words</Text>
          <div className={styles.graph}>
            <Bar data={absoluteWordsData} width={50} height={50}></Bar>
          </div>
        </div>
      )}
      <footer className={styles.footer}>
        Made with Heart by <a href="https://github.com/JGStyle">JGS.</a>
      </footer>
    </div>
  );
}
