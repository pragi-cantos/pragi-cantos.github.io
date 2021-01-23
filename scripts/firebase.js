/**************************************************************************************************
 * Firebase methods
 **************************************************************************************************/

var db = firebase.firestore();
db.useEmulator("localhost", 8080);

db.collection("cities").doc("LA").set({
    name: "Los Angeles",
    state: "CA",
    country: "USA"
})
.then(function() {
    console.log("Document successfully written!");
})
.catch(function(error) {
    console.error("Error writing document: ", error);
});

// store the json as string and reconstruct pdf when user wants to download
function sendToFirestore(data) {
    // var user_email = document.getElementById('user_email').innerText;
    var user_email="pragi.nyu@gmail.com"
    db.collection('data').add({
        mail: user_email,
        data: data,
        time: firebase.firestore.Timestamp.fromDate(new Date())
    })
    .then(function(docRef) {
        alert("Successfully added document to cloud. You can access all your generated invoices from the history page.");
    })
    .catch(function(error) {
        alert("Error adding document to cloud.");
    });
}

function retrieveUserItemsData() {
    // var user_email = firebase.auth().currentUser.email;
    var user_email = "pragi.nyu@gmail.com"
    db.collection("items").doc(user_email)
    .get()
    .then(function(doc) {
        if (doc.exists) {
            var recv_data = doc.data();
            var data = JSON.parse(recv_data['data']);

            var items = data['items'];
            var count = items.length;

            for (var index = 0; index < count; index++) {
                var item = items[index];
                item.Qty = 1;

                var key = item['Name'];
                itemData[key] = item;
                itemTerms.push(key);
            }
        }
        else {

        }
    })
    .catch(function(error) {
        // alert("Error fetching your items data.");
    });
}

function retrieveUserClientsData() {
    var user_email = firebase.auth().currentUser.email;

    db.collection("clients").doc(user_email)
    .get()
    .then(function(doc) {
        if (doc.exists) {
            var recv_data = doc.data();
            var data = JSON.parse(recv_data['data']);

            var clients = data['clients'];
            var count = clients.length;

            for (var index = 0; index < count; index++) {
                var client = clients[index];

                var key = client['client_name'];
                clientData[key] = client;
                clientTerms.push(key);
            }
        }
        else {

        }
    })
    .catch(function(error) {
        // alert("Error fetching your clients data.");
    });
}
