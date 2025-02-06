# Badminton Ranking System (BRS)

A web application for managing badminton player rankings and matches.

## Features

- Player ranking management
- Match history tracking
- Score calculation
- Google SSO authentication
- Admin dashboard for managing games and players
- Real-time match score keeping
- Player statistics and performance tracking

## Tech Stack

### Backend
- Java 17
- Spring Boot
- MySQL
- JWT Authentication

### Frontend  
- Next.js
- TypeScript
- Tailwind CSS
- DaisyUI

### Infrastructure
- Docker
- Ansible
- GitHub Actions
- NGINX (SWAG)

## Development

### Prerequisites
- Java 17
- Node.js 20+
- MySQL 8+
- Docker & Docker Compose

### Local Setup
1. Clone the repository
2. Configure environment variables in `.env.local`
3. Start MySQL database
4. Run backend: `./gradlew bootRun`
5. Run frontend: `npm run dev`

## Deployment

The application can be deployed using:
1. Docker Compose
2. Ansible Playbook

See deployment documentation for details.

## License

MIT License

## Contributors

- [Amila Banuka](https://github.com/amilabanuka) - Backend Developer
- [Nishan Karunarathna](https://github.com/digitizelab) - Frontend Developer
- [Sudheera Sampath](https://github.com/catchsudheera) - DevOps & Infrastructure