# Description

> This library is for next.js and react only.

- Customize the calendar component
- Data mapping support
- And more... do whatever you need

This CLI automatically copies the calendar component files from the GitHub repository and places them in your project.
<br>

# CLI Calendar

Add the calendar component to your project.

# Usage

## create project

```bash
# next.js
npx create-next-app@latest

# React
npm create vite <project-name> --template react<ts,js>

#or npm i create-react-app...
```

## install

```bash
npm install cli-custom-calendar
#or
pnpm add  cli-custom-calendar
yarn add cli-custom-calendar
```

## init

```bash
npx cli-calendar init
#or
yarn, pnpm add cli-calendar init
```

During initialization, you'll be prompted to: <br>
<span style='font-size:21px'>Choose your styling</span>

- <span style='color:#886701; font-weight:bold; background-color:rgb(255, 205, 58); padding:0 5px '>CSS Modules</span>
- <span style='color:#886701; font-weight:bold; background-color:rgb(255, 205, 58); padding:0 5px '>Tailwind CSS</span>

<br>

<div style='font-size:18px'>After parsing your project info,
<br>a <code>module.json</code> file will be created in your project</div>

<br>

```tsx
// module.json
{
  "name": "Calendar",
  "version": "...",
  "description": "A customizable calendar component using Day.js",
  "packageManager": "pnpm", // your project manager
  "isSrcDir": true, // path resolve
  "type": "react", // react or next
  "isRsc": false, // next.js pages or app
  "isTsx": true, // typescript or javascript
  "isUsingAppDir": false, // next.js & Dirpath
  "styleType": "Tailwind",// style type
  "pathResolve": "path" // template path
}
```

<br>

## add

To add the calendar component, use the following CLI command:

```bash
npx cli-calendar add
#or
yarn, pnpm cli-calendar add
```

## Removal Option

After installing the Calendar Component, you can uninstall my package and remove the `module.json` file if you no longer need them.

```bash
npm uninstall cli-custom-calendar
#or
yarn, pnpm remove cli-custom-calendar
```

## Dependencies

This project uses the following dependencies:

- Day.js for date manipulation
- clsx for conditional classNames
- class-variance-authority for utility class management
- Tailwind CSS (optional) or CSS Modules

<br>
<br>

---

<br>
<br>

# info

```tsx
//2024.09.19 ~ ing
@todo
mk demo
dev template
dev
```

# note

<span style='font-size:21px'>If you encounter any issues or errors while using this package, please feel free to open an issue on the repository.</span>
<a href='https://github.com/lunaxislu/cli-calendar-lib/issues'>https://github.com/lunaxislu/cli-calendar-lib/issues</a>
