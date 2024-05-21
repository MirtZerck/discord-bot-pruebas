# Usa una imagen base de Node.js
FROM node:18

# Crea un directorio de trabajo
WORKDIR /app

# Copia los archivos package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm ci

# Copia el resto del código del proyecto
COPY . .

# Compila el código TypeScript
RUN npm run build

# Registra los comandos slash
RUN npm run postbuild

# Expon el puerto que utiliza el bot (opcional, si usa un puerto)
EXPOSE 3000

# Comando para ejecutar el bot
CMD ["npm", "start"]
