# server Folder

this is backend of the application which is made with node + express and mongoDB Atlas

lets first look at the folder we are working with:

```bash
server/
├── controllers/    → core functnality and bussiness logic (Controller)
└── helpers/        → cloud service (e.g cloudinary, paypal)
└── middleware/     → auth middleware
└── models/         → mongoDB documents Schema's (Model)
└── routes/         → all router for different services (View)
└── uploads/        → an queue folder to upload file into the cloud
└── server.js       → starting file for server (index.js or app.js)
└── .env            → to make one take reference of .env.example
```

as you can see we are following MVC (Model, View, Controller) architecture for our backend

to run the backend of our app run: 

```bash 
npm run dev
```

### we also added redis so u may have to run it in another terminal:

you can install or download it to ur local space but we recommend using docker in local and prod enviroment

```bash
docker run --name redis -p 6379:6379 -d redis
docker start redis
```

to ckeck if it running:

```bash
docker exec -it redis redis-cli ping
```