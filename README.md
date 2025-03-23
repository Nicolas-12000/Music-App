# 🎵 Music App

🚀 **Music App** es una aplicación web para gestionar y reproducir música, desarrollada con **React**, **TypeScript**, **Vite** y siguiendo los principios de **Clean Architecture + Hexagonal Architecture**.

---

## 📌 Características

- 🎶 **Gestión de Canciones** con una lista doblemente enlazada.
- 🏗 **Arquitectura Modular** con separación clara entre **Core**, **Infrastructure** y **UI**.
- 🎨 **Interfaz Moderna** con **TailwindCSS** y animaciones en **Framer Motion**.
- 🛠 **Patrones de Diseño** implementados: Singleton, Observer, Decorator, Factory, Strategy y Adapter.
- 📦 **Almacenamiento Local** con LocalStorage.
- 🎧 **Posible integración con la API de Spotify** *(futuro desarrollo)*.

---

## 🚀 Instalación y Uso

### 1️⃣ Clonar el Repositorio
```sh
git clone https://github.com/Nicolas-12000/Music-App.git
cd Music-App
```

### 2️⃣ Instalar Dependencias
```sh
npm install
```

### 3️⃣ Ejecutar en Desarrollo
```sh
npm run dev
```

### 4️⃣ Construir para Producción
```sh
npm run build
```

---

## 📂 Estructura del Proyecto

```
Music-App/
│── src/
│   ├── core/             # Lógica de negocio
│   │   ├── entities/     # Entidades de dominio
│   │   ├── usecases/     # Casos de uso
│   │   ├── ports/        # Interfaces de comunicación
│   ├── infrastructure/   # Infraestructura (API, persistencia, adaptadores)
│   ├── ui/               # Interfaz de usuario (React + Context API)
│   │   ├── components/   # Componentes reutilizables
│   │   ├── contexts/     # Gestión de estado global
│   │   ├── themes/       # Configuración de estilos
│── public/
│── package.json
│── tsconfig.json
│── vite.config.ts
│── README.md
```

---

## 🎯 Estilo de Código con ESLint y Prettier

Este proyecto utiliza **ESLint** y **Prettier** para mantener un código limpio y consistente.

### 📌 Reglas Adicionales de ESLint
Si deseas habilitar reglas avanzadas de linting, puedes actualizar `eslint.config.js`:
```js
import tseslint from "@typescript-eslint/eslint-plugin";
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  plugins: {
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```

Para corregir errores automáticamente, ejecuta:
```sh
npm run lint --fix
```

---

## 🛠 Tecnologías Utilizadas

| Tecnología         | Descripción |
|-------------------|-------------|
| **React**        | Biblioteca para construir interfaces |
| **TypeScript**   | Tipado estático para mayor seguridad |
| **Vite**         | Empaquetador ultrarrápido |
| **TailwindCSS**  | Framework de estilos |
| **Framer Motion**| Animaciones fluidas |
| **LocalStorage** | Almacenamiento de datos en el navegador |
| **ESLint**       | Herramienta de análisis de código |

---

## 📝 Contribuciones

¡Las contribuciones son bienvenidas! Si deseas mejorar este proyecto, sigue estos pasos:
1. **Haz un Fork** del repositorio.
2. **Crea una nueva rama** (`git checkout -b feature-nueva-funcionalidad`).
3. **Realiza tus cambios y haz un commit** (`git commit -m 'Agregada nueva funcionalidad'`).
4. **Haz un push a tu fork** (`git push origin feature-nueva-funcionalidad`).
5. **Abre un Pull Request** 🚀.

---

## 🏆 Autor

👤 **Nicolas-12000**  
📌 GitHub: [Nicolas-12000](https://github.com/Nicolas-12000)

💡 Si te gustó este proyecto, ¡no olvides dejar una ⭐ en GitHub!

---

## 📜 Licencia

Este proyecto está bajo la licencia **MIT**. ¡Úsalo libremente! 🎵

