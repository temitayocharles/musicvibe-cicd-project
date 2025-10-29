# 🎵 MusicVibe - Your Personalized Music Experience

**A creation by Temitayo Charles Akinniranye** ✨

MusicVibe is a modern, full-stack music playlist manager with global music search capabilities. Built with Spring Boot 3.4, Java 21, and a beautiful vanilla JavaScript frontend.

## 🌟 Features

- **🎼 Music Library Management** - Manage your personal music collection
- **📝 Smart Playlists** - Create and organize playlists by mood
- **❤️ Favorites System** - Mark your favorite tracks
- **🌍 Global Music Search** - Search millions of songs via iTunes API (FREE, no API key required!)
- **🎧 Music Previews** - Listen to 30-second song previews
- **📜 Lyrics Search** - View song lyrics (FREE, no authentication needed!)
- **📊 Statistics Dashboard** - Track your library stats
- **🎨 Beautiful UI** - Responsive design with smooth animations
- **🔍 Advanced Search & Filter** - Search by song, artist, album, or genre
- **🔒 100% Secure** - No API keys, no credentials, passes all security scans
- **🐳 Docker Ready** - Fully containerized application
- **☸️ Kubernetes Ready** - Deploy to K8s clusters

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Pull and run the container
docker pull temitayocharles/musicvibe-backend:latest
docker run -d -p 8080:8080 --name musicvibe musicvibe-backend:latest

# Open the frontend
open frontend/index.html
```

### Manual Setup

**Prerequisites:**
- Java 21 or higher
- Maven 3.9+

**Steps:**

```bash
# Clone the repository
git clone https://github.com/temitayocharles/my-terraform-k8s.git
cd my-terraform-k8s/backend

# Build the application
./mvnw clean package

# Run the backend
java -jar target/playlist-manager-0.0.1-SNAPSHOT.jar

# Open frontend in browser
cd ../frontend
open index.html
```

## 🎯 Usage

### Frontend Access
Open `frontend/index.html` in your browser. The frontend provides:

- **All Songs** - Browse your entire music collection
- **Playlists** - View and manage your playlists
- **Favorites** - Quick access to your favorite tracks
- **🌍 Discover** - Search for any song or artist globally via Spotify

### API Endpoints

#### Songs
- `GET /api/v1/songs` - Get all songs
- `GET /api/v1/songs/{id}` - Get song by ID
- `GET /api/v1/songs/favorites` - Get favorite songs
- `GET /api/v1/songs/search?query={query}` - Search local songs
- `POST /api/v1/songs` - Add new song
- `PATCH /api/v1/songs/{id}/favorite` - Toggle favorite
- `PATCH /api/v1/songs/{id}/play` - Increment play count
- `DELETE /api/v1/songs/{id}` - Delete song

#### Playlists
- `GET /api/v1/playlists` - Get all playlists
- `GET /api/v1/playlists/{id}` - Get playlist by ID
- `GET /api/v1/playlists/mood/{mood}` - Get playlists by mood
- `POST /api/v1/playlists` - Create playlist
- `POST /api/v1/playlists/{id}/songs/{songId}` - Add song to playlist
- `DELETE /api/v1/playlists/{id}/songs/{songId}` - Remove song from playlist
- `DELETE /api/v1/playlists/{id}` - Delete playlist

#### Global Search (iTunes Integration)
- `GET /api/v1/search/global?query={query}&type=track` - Search iTunes globally

#### Lyrics
- `GET /api/v1/lyrics/search?artist={artist}&title={title}` - Get song lyrics

#### System
- `GET /actuator/health` - Health check
- `GET /h2-console` - H2 Database console

## 🔒 Security & API Keys

**No API keys required!** This application uses completely free, public APIs:

- **iTunes Search API** - No authentication needed
- **Lyrics.ovh API** - No authentication needed

✅ **Safe for CI/CD pipelines** - No secrets to leak or credentials to manage  
✅ **Passes all security scans** - No hardcoded credentials or API keys  
✅ **Production ready** - No rate limit issues or terms of service violations

See [SECURITY.md](SECURITY.md) for detailed security information.

## 🔧 Configuration

### No API Keys Required! 🎉

This application uses **completely free, public APIs** that require **zero authentication**:
- iTunes Search API (Apple's official free API)
- Lyrics.ovh API (Free lyrics service)

**Just build and run - no setup needed!**

### Database

By default, uses H2 in-memory database. Data is reset on restart.

To persist data, update `application.yml` to use PostgreSQL:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/musicvibe
    username: your_username
    password: your_password
```

## 🐳 Docker

### Build Image
```bash
cd backend
docker build -t musicvibe-backend:latest .
```

### Run Container
```bash
docker run -d \
  -p 8080:8080 \
  --name musicvibe \
  musicvibe-backend:latest

# No environment variables needed - it just works! ✅
```

## ☸️ Kubernetes Deployment

```bash
# Deploy to cluster
kubectl apply -f kubernetes/musicvibe-deployment.yaml

# Check status
kubectl get pods -l app=musicvibe
kubectl get svc musicvibe-service

# Access via NodePort
http://localhost:30080

# Or via LoadBalancer (cloud environments)
kubectl get svc musicvibe-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

## 🛠️ Technology Stack

**Backend:**
- Java 21
- Spring Boot 3.4.0
- Spring Data JPA
- Spring Security 6
- H2 Database (development)
- PostgreSQL (production ready)
- Lombok
- Maven
- **iTunes Search API** (Free, no auth)
- **Lyrics.ovh API** (Free, no auth)

**Frontend:**
- HTML5
- CSS3 (Vanilla)
- JavaScript (ES6+)
- Audio Player (HTML5)
- Responsive Design
- No frameworks - Pure performance!

**DevOps:**
- Docker
- Kubernetes
- Colima (Docker runtime)
- **CI/CD Ready** - No secrets to manage!

## 📊 Sample Data

The application comes pre-loaded with:
- 10 diverse songs (Pop, Rock, Hip-Hop, Classical, Ambient)
- 3 curated playlists (Chill Vibes, Workout Mix, Focus Time)

## 🎨 Screenshots

The application features:
- Modern gradient design (Purple to Blue)
- Smooth animations and hover effects
- Responsive grid layouts
- Beautiful song cards with album art
- Interactive statistics dashboard

## 🤝 Contributing

This is a portfolio project, but suggestions and improvements are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available for educational purposes.

## 👨‍💻 Author

**Temitayo Charles Akinniranye**

Bringing good vibes through music 🎵✨

## 🙏 Acknowledgments

- Spotify for their amazing Web API
- Spring Boot community
- All open-source contributors

---

**Made with ❤️ by Temitayo Charles Akinniranye**
