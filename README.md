<a id="readme-top"></a>

## Image Scrapping And DL

Useful repository for artificial intelligence images datasets

## Get started

Start collecting images from website easily using these two commands

```bash
yarn install
yarn start --url=<WEBSITE_URL>
```

### Example

```bash
yarn install
yarn start --url=https://www.camif.fr/recherche?q=lit
# By default all <img> tag available in the DOM will be downloaded, you can filter by specifying the class with --select option
yarn start --url=https://www.camif.fr/recherche?q=lit --select=".myloop-images-selector"
```

that's it

## Acknowledgments

- Node.js - JavaScript runtime environment
- puppeteer - Headless Chrome Node.js API

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>
