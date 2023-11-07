document.addEventListener("DOMContentLoaded", function () {
  const searchData = document.getElementById("searchData");
  const searchButton = document.getElementById("searchButton");
  const resultsList = document.getElementById("resultsList");
  const sounds = document.getElementById("sounds");
  const relatedURL = document.getElementById("relatedURL");
  const partOfSpeechDropdown = document.getElementById("partOfSpeechDropdown");
  const top5Button = document.getElementById("top5Button");
  const likedWordsSection = document.getElementById("likedWordsSection");
  const likedWordsList = document.getElementById("likedWordsList");

  // Add a function to get user's liked words from local storage
  function getLikedWords() {
    const likedWords = JSON.parse(localStorage.getItem("likedWords")) || [];
    return likedWords;
  }

  // Add a function to update user's liked words in local storage
  function updateLikedWords(likedWords) {
    localStorage.setItem("likedWords", JSON.stringify(likedWords));
  }

  // Initialize liked words from local storage
  let likedWords = getLikedWords();

  // Function to handle the "love" button click
  function onLoveButtonClick(word) {
    if (!likedWords.includes(word)) {
      likedWords.push(word);
      updateLikedWords(likedWords);
    }
  }

  searchButton.addEventListener("click", function () {
    const word = searchData.value.trim();
    if (word === "") {
      clearResults();
      return;
    }

    const selectedPartOfSpeech = partOfSpeechDropdown.value;

    // Make an API request to get the word data
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then((response) => response.json())
      .then((data) => {
        clearResults();
        displayWordData(data, selectedPartOfSpeech, word);
      })
      .catch((error) => console.error(error));
  });

  function clearResults() {
    resultsList.innerHTML = "";
    sounds.innerHTML = "";
    relatedURL.innerHTML = "";
  }

  function displayWordData(data, selectedPartOfSpeech, word) {
    clearResults();

    data.forEach((entry) => {
      entry.meanings.forEach((meaningData) => {
        if (meaningData.partOfSpeech === selectedPartOfSpeech) {
          meaningData.definitions.forEach((def) => {
            const meaningItem = document.createElement("li");

            // Add a "love" button next to each word
            const loveButton = document.createElement("button");
            loveButton.textContent = "\u2764";
            loveButton.addEventListener("click", () => onLoveButtonClick(word));

            meaningItem.innerHTML = `
              <strong>Part of Speech:</strong> ${meaningData.partOfSpeech}<br>
              <br>
              <strong>Word:</strong> ${word}<br>
              <strong>Meaning:</strong> ${def.definition || `<span style="color: red;">--no meaning for the word ${word}--</span>`}<br>
              <strong>Example:</strong> ${def.example || `<span style="color: red;">--no example for the word ${word}--</span>`}<br>
              <strong>Synonyms:</strong> ${(def.synonyms.length > 0 ? def.synonyms.join(', ') : `<span style="color: red;">--no synonyms for the word ${word}--</span>`)}<br>
              <strong>Antonyms:</strong> ${(def.antonyms.length > 0 ? def.antonyms.join(', ') : `<span style="color: red;">--no antonyms for the word ${word}--</span>`)}<br>
            `;

            // Append the "love" button and word data
            meaningItem.prepend(loveButton);
            resultsList.appendChild(meaningItem);
          });
        }
      });
    });

    for (const phonetic of data[0].phonetics) {
      if (phonetic.audio) {
        const audioElement = document.createElement("audio");
        audioElement.setAttribute("controls", true);
        audioElement.innerHTML = `<source src="${phonetic.audio}" type="audio/mpeg">Your browser does not support the audio element.`;
        sounds.appendChild(audioElement);
      }
    }

    for (const sourceUrl of data[0].sourceUrls) {
      const link = document.createElement("a");
      link.href = sourceUrl;
      link.target = "_blank";
      link.textContent = "Source URL";
      relatedURL.appendChild(link);
    }
  }

  // Function to show/hide the "Top 5 Words" section
  function toggleLikedWordsSection() {
    likedWordsSection.style.display = likedWordsSection.style.display === "none" ? "block" : "none";
  }

  // Event listener for the "Top 5 Words" button
  top5Button.addEventListener("click", function () {
    // Show/hide the "Top 5 Words" section
    toggleLikedWordsSection();

    // Display the liked words
    displayLikedWords();
  });

  let wordToUpdate, partOfSpeechToUpdate;

  // Function to display liked words
  function displayLikedWords() {
    likedWordsList.innerHTML = ""; // Clear previous entries

    // Display liked words in the list with update and delete buttons
    likedWords.forEach((word) => {
      const likedWordItem = document.createElement("li");
      likedWordItem.innerHTML = `
        <span>${word}</span>
        <button class="update-button" data-word="${word}">Update</button>
        <button class="delete-button" data-word="${word}">Delete</button>
      `;
      likedWordsList.appendChild(likedWordItem);

      // Attach click event listeners for update and delete buttons
      likedWordItem.querySelector(".update-button").addEventListener("click", (event) => {
        wordToUpdate = event.target.getAttribute("data-word");
        // Implement the logic to update the word using a custom input field
        const updateWordField = document.createElement("input");
        updateWordField.placeholder = "Enter the updated word";
        updateWordField.addEventListener("keyup", function (e) {
          if (e.key === "Enter") {
            const updatedWord = updateWordField.value;
            if (updatedWord.trim() !== "") {
              // Update the liked word in the list
              likedWords[likedWords.indexOf(wordToUpdate)] = updatedWord;
              updateLikedWords(likedWords);
              // Refresh the display of liked words
              displayLikedWords();
            }
          }
        });
        likedWordItem.appendChild(updateWordField);
      });

      likedWordItem.querySelector(".delete-button").addEventListener("click", (event) => {
        const wordToDelete = event.target.getAttribute("data-word");
        // Implement the logic to delete the word with a confirmation dialog
        const confirmDelete = confirm(`Are you sure you want to delete '${wordToDelete}'?`);
        if (confirmDelete) {
          // Remove the liked word from the list
          likedWords = likedWords.filter((likedWord) => likedWord !== wordToDelete);
          updateLikedWords(likedWords);
          // Refresh the display of liked words
          displayLikedWords();
        }
      });
    });
  }
});
