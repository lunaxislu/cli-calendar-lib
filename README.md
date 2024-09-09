<br>

# Caution

> This library is for next.js and react only.

<br>

# CLI Calendar

A customizable calendar component CLI tool built with Day.js, supporting both CSS Modules and Tailwind CSS. This CLI allows you to easily integrate a calendar component into your project with a few simple commands.

## About the Library

This library is specifically designed for **React** and **Next.js** projects. It provides an easy way to integrate customizable calendar components using Day.js, and supports both TypeScript and JavaScript environments. Whether you're building a React application or a Next.js project, this CLI tool helps you quickly add a calendar component with minimal dependencies.

## Features

- Add calendar components dynamically to your project
- Choose between CSS Modules and Tailwind CSS for styling
- Automatically installs required dependencies like Day.js, Tailwind CSS, clsx, and class-variance-authority
- Supports both TypeScript and JavaScript projects

## Acknowledgements and Inspiration

This project was inspired by **[shadcn](https://ui.shadcn.com/)**. The main goal was to reduce dependencies by focusing solely on CLI commands that copy and paste components from a URL. The components are retrieved directly from the following repository:

- [Calendar Components](https://github.com/lunaxislu/cli-calendar-lib)

This approach minimizes project dependencies and simplifies usage for beginners. Special thanks to shadcn for the inspiration behind this library. This library is designed with beginners in mind, providing a simple and easy-to-use tool for integrating calendar components into any project.

## Installation

To install the CLI tool globally, run:

```bash
npm install cli-custom-calendar
```

Or, if you prefer pnpm or yarn:

```bash
pnpm add  cli-custom-calendar
# or
yarn add cli-custom-calendar
```

## Usage

Once the CLI is installed, you can run the following commands to set up your calendar component:

### Initialize your project

This command will detect your project setup and guide you through installing the necessary packages.

```bash
npx cli-calendar init
#or
pnpm add cli-calendar init
```

During the initialization, you'll be asked to choose a styling solution:

- CSS Modules
- Tailwind CSS

Depending on your choice, the required packages will be installed, and the necessary configuration files will be created.

### 2. Add a calendar component

After initializing your project, you can add the calendar component to your project using the following command:

```bash
npx cli-calendar add
#or
yarn,pnpm cli-calendar add
```

This will automatically copy the calendar component files from the GitHub repository and place them in your project.

## Dependencies

This project uses the following dependencies:

Day.js for date manipulation
clsx for conditional classNames
class-variance-authority for utility class management
Tailwind CSS (optional) or CSS Modules
