# cryptoBot

Bot de Telegram para consultar precios de criptomonedas y administrar mensajes de bienvenida y publicidad.

## Requisitos

-   Node.js (v18 o superior recomendado)
-   npm
-   Una cuenta de bot en Telegram (con token)
-   Un archivo `.env` con las variables necesarias

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/ingferchorojas/cryptoBot.git
cd cryptoBot
```

2. Instalar las dependencias:

```bash
npm install
```

3. Crear un archivo `.env` en la raíz del proyecto con este contenido:

```env
BOT_TOKEN=tu_token_de_telegram
USER_ID=tu_id_de_usuario_en_telegram
DEFAULT_WELCOME_MESSAGE="Bienvenido al bot de criptomonedas"
```

4. Ejecutar el bot:

```bash
node index.mjs
```

> Asegúrate de que el archivo `index.mjs` sea el nombre correcto de tu archivo principal. Cámbialo si es necesario.

## Comandos disponibles

-   `/start`: Muestra el mensaje de bienvenida
-   `/welcome_message <mensaje>`: Establece un nuevo mensaje de bienvenida (solo admin)
-   `/ads <mensaje>`: Establece o elimina el mensaje de publicidad (solo admin)
-   `/admin <mensaje>`: Comando libre solo para el administrador
-   `<símbolo>`: Escribe por ejemplo `BTC`, `ETH`, `TRX` para obtener el precio en USDT

## Notas

-   El bot almacena la configuración en `db.json` usando `lowdb`.
-   La publicidad solo se muestra ocasionalmente (probabilidad ajustable en el código).
-   Recuerda no subir tu archivo `.env` ni `db.json`.

---
