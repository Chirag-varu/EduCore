# client Folder

this is frontend of the application which is made with Vite + React and tailwind v3

lets first look at the folder we are working with:

```bash
client/
├── public/    → we have banner and favicon images in there
└── src/       → main folder (source folder)
└── .env       → to make one take reference of .env.example
```

to run the frontend of our app run: 
```bash 
npm run dev
```

lets deep dive in our source code:

```bash
scr/
├── api/          → this is for our api gateway to backend or server using axios(providing backend endpoint)
└── assets/       → logo of our app
└── components/   → we are following folder based structure in our components
└── config        → providing varis models for our app like login / register details
└── context       → providing context of our app like in app memory
└── hooks         → toast config and management
└── pages         → pages in our app and there code
└── services      → all services fuction or methods are listed (e.g loginService / registerService)
```