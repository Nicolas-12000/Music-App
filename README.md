Music App

Este proyecto es una aplicación web de música desarrollada con React, TypeScript y Vite, siguiendo principios de Clean Architecture y Hexagonal Architecture. Utiliza una lista doblemente enlazada para gestionar canciones y patrones de diseño como Singleton, Observer, Decorator, Factory, Strategy y Adapter.

Tecnologías utilizadas

React + TypeScript + Vite

TailwindCSS para estilos

Framer Motion para animaciones

LocalStorage para almacenamiento

Eslint y Prettier para el formateo y calidad del código

Instalación

Clona el repositorio:

git clone https://github.com/Nicolas-12000/Music-App.git
cd music-app

Instala las dependencias:

npm install

Inicia el entorno de desarrollo:

npm run dev

Configuración de ESLint

Para habilitar reglas avanzadas de ESLint, puedes configurar eslint.config.js de la siguiente manera:

import tseslint from '@typescript-eslint/eslint-plugin'
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  plugins: {
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})

Estructura del Proyecto

/music-app
├── src/
│   ├── core/                # Lógica de negocio
│   │   ├── entities/        # Entidades
│   │   ├── usecases/        # Casos de uso
│   │   ├── ports/           # Interfaces de puertos
│   ├── infrastructure/      # Adaptadores
│   │   ├── api/             # Integraciones con APIs externas
│   │   ├── persistence/     # Persistencia de datos (LocalStorage, IndexedDB, etc.)
│   ├── ui/                  # Interfaz de usuario
│   │   ├── components/      # Componentes reutilizables
│   │   ├── contexts/        # Context API y estado global
│   │   ├── themes/          # Temas y estilos
├── .eslintrc.js             # Configuración de ESLint
├── tailwind.config.js       # Configuración de Tailwind
├── tsconfig.json            # Configuración de TypeScript
├── vite.config.ts           # Configuración de Vite

Contribución

Realiza un fork del repositorio.

Crea una nueva rama (git checkout -b feature-nueva-funcionalidad).

Realiza tus cambios y haz commit (git commit -m "Agrega nueva funcionalidad").

Sube tu rama (git push origin feature-nueva-funcionalidad).

Abre un Pull Request.

Licencia

Este proyecto está bajo la licencia MIT.