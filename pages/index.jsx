import { Text, Spacer, Progress, Button, Checkbox } from "@geist-ui/react";
import { CheckInCircleFill } from "@geist-ui/react-icons"
import { useEffect, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import styles from "../styles/Home.module.css";
const whatsapp = require("whatsapp-chat-parser")
const emojiRegexRGI = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g
const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g
const matchWords = /[a-zA-Z_\u00C0-\u017F]+/g

export default function Home() {
  const [file, setFile] = useState([])
  const [contacts, setContacts] = useState([])
  const [chooseContacts, setChooseContacts] = useState(false)
  const [limitedContacts, setLimitedContacts] = useState([]);

  const [progress, setProgress] = useState(0)
  const [analyseProgress, setAnalyseProgress] = useState(0)

  const [displayAll, setDisplayAll] = useState(false);

  // Block 1 (1 chart)
  const [totalMessages, setTotalMessages] = useState(0)
  const [mostMessagesCount, setMostMessagesCount] = useState(0)
  const [mostMessagesAuthor, setMostMessagesAuthor] = useState("")
  const [countData, setCountData] = useState({});

  // Block 2 (2 charts)
  const [totalWords, setTotalWords] = useState(0)
  const [averageWords, setAverageWords] = useState(0)
  const [averageWordsData, setAverageWordsData] = useState({})
  const [absoluteWordsData, setAbsoluteWordsData] = useState({})

  // Block 3 (1 chart)
  const [uniqueWords, setUniqueWords] = useState(0)
  const [wordContentData, setWordContentData] = useState({})

  // Block 4 ()
  const [mostUsedEmoji, setMostUsedEmoji] = useState('')
  const [absolutEmojiData, setAbsolutEmojiData] = useState({})
  const [emojiPersonwise, setEmojiPersonwise] = useState([])
  const [emojiAuthors, setEmojiAuthors] = useState([])
  const [mostEmojisCount, setMostEmojisCount] = useState(0)
  const [mostEmojisAuthor, setMostEmojisAuthor] = useState("")

  function processData(messages) {
    let zip = (...a) => a[0].map((_, n) => a.map((b) => b[n]))
    setAnalyseProgress(100)
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
    let countdata = JSON.parse(JSON.stringify(dataPreset))
    // ANALISE AMOUNT OF WORDS
    let worddata = JSON.parse(JSON.stringify(dataPreset))
    let absoluteworddata = JSON.parse(JSON.stringify(dataPreset))
    let totalwords = 0
    let countwordspersonwiseAuthors = []
    let countwordspersonwiseAmount = []
    // ANALISE WORDS THEMSELVES
    let wordcontentdata = JSON.parse(JSON.stringify(dataPreset))
    let wordsnames = []
    let wordsamount = []
    let wordsblacklist = ["anhang", "photo", "jpg", "weggelassen", "bild", "image", "omitted", "png", "sticker", "webp", "nachricht", "gelöscht", "deleted", "message"]
    // ANALISE EMOJIS
    let emojidata = JSON.parse(JSON.stringify(dataPreset))
    let emojiid = []
    let emojicount = []

    let emojipersonwise = []
    let emojiauthors = []

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
      let words = message.message.match(matchWords);
      if (words) {
        let amountwords = words.length;
        totalwords += amountwords;

        if (countwordspersonwiseAuthors.includes(message.author)) {
          const index = countwordspersonwiseAuthors.indexOf(message.author)
          countwordspersonwiseAmount[index] += amountwords;
        } else {
          countwordspersonwiseAuthors.push(message.author);
          countwordspersonwiseAmount.push(amountwords);
        }
      }
      else{
      if (!(countwordspersonwiseAuthors.includes(message.author))) {
          countwordspersonwiseAuthors.push(message.author);
          countwordspersonwiseAmount.push(0);
        }
      }

      // ANLISE WORDS THEMSELVES
      if (words) {
        words.forEach((word) => {
          if(!(wordsblacklist.includes(word))){
            if (wordsnames.includes(word)) {
              wordsamount[wordsnames.indexOf(word)] += 1
            }
            else {
              wordsnames.push(word)
              wordsamount.push(1)
            }
          }
        })
      }

      // ANALISE EMOJIS
      let emojis = message.message.match(emojiRegex)
      if (emojis) {
        emojis.forEach(emoji => {
          if(emojiid.includes(emoji)){
            emojicount[emojiid.indexOf(emoji)] += 1
          }
          else {
            emojiid.push(emoji)
            emojicount.push(1)
          } 

          if(emojiauthors.includes(message.author)) {
            if(Object.keys(emojipersonwise[emojiauthors.indexOf(message.author)]).includes(emoji)){
              emojipersonwise[emojiauthors.indexOf(message.author)][emoji] +=1
            }
            else {
              emojipersonwise[emojiauthors.indexOf(message.author)][emoji] =1
            }
          }
          else {
            emojiauthors.push(message.author)
            let o = {}
            o[emoji] = 1
            emojipersonwise.push(o)
          }
        })
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

    // ANALISE WORDS THEMSELVES
    setUniqueWords(Object.keys(wordsamount).length);

    [wordsnames, wordsamount] = zip(
      ...zip(wordsnames, wordsamount).sort(
        (x, y) => y[1] - x[1]
      )
    );
    wordsnames = wordsnames.splice(0,8)
    wordsamount = wordsamount.splice(0,8)
    wordcontentdata.labels = wordsnames
    wordcontentdata.datasets[0].data = wordsamount
    setWordContentData(wordcontentdata);


    // EMOJI ANALYSIS
    [emojiid, emojicount] = zip(
      ...zip(emojiid, emojicount).sort(
        (x, y) => y[1] - x[1]
      )
    )
    emojiid = emojiid.splice(0,8)
    emojicount = emojicount.splice(0,8)
    emojidata.labels = emojiid
    emojidata.datasets[0].data = emojicount

    setAbsolutEmojiData(emojidata)
    setMostUsedEmoji(emojiid[0])

    let individualEmojis = []

    console.log(emojiauthors)
    console.log(emojipersonwise)
    emojiauthors.forEach(author => {
      let count = 0
      let pecount = emojipersonwise[emojiauthors.indexOf(author)]
      for (let i = 0; i < Object.keys(emojipersonwise[emojiauthors.indexOf(author)]).length; i++) {
        try {
          count += pecount[Object.keys(pecount)[i]]
        } catch(err) {
          console.log(err)
        }
      }
      console.log("count ", count)
      if (count > mostEmojisCount) {
        setMostEmojisAuthor(author)
        setMostEmojisCount(count)
      }

      // sort by size
      individualEmojis.push(Object.keys(emojipersonwise[emojiauthors.indexOf(author)]).map(key => {
        [key, emojipersonwise[emojiauthors.indexOf(author)][key]]
      }).sort((a, b) => {
        return b[1]-a[1]
      }).splice(0, 3))
    });
    console.log(individualEmojis)

    setEmojiAuthors(emojiAuthors)
    setEmojiPersonwise(emojiPersonwise)

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
      data[i].message = msg.message.toLowerCase()
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
          <Text h4>(If present, Uncheck groupname and System)</Text>
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
            {averageWordsData.labels[0]} uses the most words. 
          </Text>
          <div className={styles.graph}>
            <Bar data={averageWordsData} width={50} height={50} options={{plugins:{legend:{display:false}}}}></Bar>
          </div>
          <Text p>In total,{" "}
            {totalWords} words were sent.</Text>
          <div className={styles.graph}>
            <Bar data={absoluteWordsData} width={50} height={50} options={{plugins:{legend:{display:false}}}}></Bar>
          </div>
          <Text p>{uniqueWords} unique words were used</Text>
          <div className={styles.graph}>
            <Bar data={wordContentData} options={{indexAxis: 'y', plugins:{legend:{display:false}}}} width={50} height={50}></Bar>
          </div>
          <Text h1 className={styles.single}>{mostUsedEmoji}</Text>
          <Text p className={styles.single}>is the most used emoji.</Text>
          <div className={styles.graph}>
            <Bar data={absolutEmojiData} options={{indexAxis: 'y', plugins:{legend:{display:false}}}} width={50} height={50}></Bar>
          </div>
          <Text p>{mostEmojisAuthor} is the emoji king. With {mostEmojisCount} emojis, she/he sent the most.</Text>
        </div>
      )}
      <footer className={styles.footer}>
        Made with Heart by <a href="https://github.com/JGStyle">JGS.</a>
      </footer>
    </div>
  );
}
