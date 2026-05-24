# YesNoVoting DApp

Итоговый проект по дисциплине "Основы технологии блокчейн".

Тема: DApp для прозрачного голосования "За / Против" без возможности повторного голосования.

## Что реализовано

- смарт-контракт `YesNoVoting` на Solidity;
- функция записи `vote(bool support)`;
- функции чтения `getResults()`, `hasAddressVoted(address voter)`;
- событие `Voted(address indexed voter, bool support)`;
- проверка `require`, запрещающая повторное голосование с одного адреса;
- тесты Hardhat для записи, события и ошибочного сценария;
- frontend на Scaffold-ETH-2 с подключением MetaMask и статусом транзакции.

## Локальный запуск

```bash
yarn install
yarn chain
yarn deploy
yarn start
```

Тесты смарт-контракта:

```bash
yarn hardhat:test
```
