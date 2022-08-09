[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <h2 align="center">Expert Help Calling Queue</h2>

  <p align="center">
  Manage and receive call requests in an orderly manner (FIFO) with to connect with experts using backed by Webex Meeting
    <br />
    <a href="https://github.com/wxsd-sales/call-queue"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    View Demo
    [<a href="https://call-queue.wbx.ninja/requester">Requester Page</a> -
    <a href="https://call-queue.wbx.ninja/responder">Responser Page</a>]
    ·
    <a href="https://github.com/wxsd-sales/call-queue/issues">Report Bug</a>
    ·
    <a href="https://github.com/wxsd-sales/call-queue/issues">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#how-to-test">How to Test</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![Product Name Screen Shot][product-screenshot]](https://call-queue.wbx.ninja/requester)

Integrate Webex in a simple browser app to assist users to connect with experts fot assistance via Webex Meeting.

### How to Test
As shown in the screenshot above, there are two views embedded in this app. One view is built for the requester (left figure) and the other is for the responder (right figure).
in order for the responder to view any requests, they would need any requester to submit a request. Once a requester has submitted a request, responder will have few options to manage the request. responder could either cancel the request or accept and start a session with the requester. After the session had ended, both responder and the requester will be redirected to the initial view.

### Built With

- [Webex Browser SDK](https://github.com/webex/webex-js-sdk)
- [SvelteJS](https://reactjs.org)
- [TypeScript](https://www.typescriptlang.org/)

<!-- GETTING STARTED -->

## Getting Started

If you would like to contribute to our source code and to improve our demo, please follow the steps mentioned below:

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/wxsd-sales/call-queue.git
   ```
2. We use NVM to manage our node.js machine versioning. You can learn more about NVM [here](https://github.com/nvm-sh/nvm)
   ```sh
   nvm use
   ```
3. Install the packages via [Yarn](https://classic.yarnpkg.com/en/)
   ```sh
   npm i
   ```
4. Start the server
   ```sh
   npm start
   ```

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch in your forked repo (`git checkout -b myrepo/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin myrepo/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->

## Contact

Arash Koushkebaghi - [LinkedIn](https://www.linkedin.com/in/arash-koushkebaghi-9b1701a4/) - [Github](https://github.com/akoushke)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/WXSD-Sales/WebexVoicea.svg?style=for-the-badge
[contributors-url]: https://github.com/wxsd-sales/call-queue/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/WXSD-Sales/WebexVoicea.svg?style=for-the-badge
[forks-url]: https://github.com/wxsd-sales/call-queue/network/members
[stars-shield]: https://img.shields.io/github/stars/WXSD-Sales/WebexVoicea.svg?style=for-the-badge
[stars-url]: https://github.com/wxsd-sales/call-queue/stargazers
[issues-shield]: https://img.shields.io/github/issues/WXSD-Sales/WebexVoicea.svg?style=for-the-badge
[issues-url]: https://github.com/wxsd-sales/call-queue/issues
[license-shield]: https://img.shields.io/github/license/WXSD-Sales/WebexVoicea.svg?style=for-the-badge
[license-url]: https://github.com/wxsd-sales/call-queue/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/arash-koushkebaghi-9b1701a4/
[product-screenshot]: assets/call-queue.png