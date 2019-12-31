const express = require('express');
PORT_NUMBER = 3000;
const app = express();
app.use(express.json());

app.use(require('./routes/getRequests.js'));
app.use(require('./routes/postRequests.js'));
app.use(require('./routes/putRequests.js'));

app.listen(PORT_NUMBER, () => console.log(`listening on port ${PORT_NUMBER}...`));