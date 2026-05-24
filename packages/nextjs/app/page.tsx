"use client";

import { useMemo, useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";

const formatVotes = (value: bigint | undefined) => Number(value ?? 0n);

const Home: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const [transactionStatus, setTransactionStatus] = useState("Ожидание действия пользователя");

  const { data: results, refetch: refetchResults } = useScaffoldReadContract({
    contractName: "YesNoVoting",
    functionName: "getResults",
  });

  const { data: hasVoted, refetch: refetchHasVoted } = useScaffoldReadContract({
    contractName: "YesNoVoting",
    functionName: "hasAddressVoted",
    args: [connectedAddress],
  });

  const { writeContractAsync, isMining } = useScaffoldWriteContract({
    contractName: "YesNoVoting",
  });

  const yesVotes = formatVotes(results?.[0]);
  const noVotes = formatVotes(results?.[1]);
  const total = yesVotes + noVotes;

  const yesPercent = useMemo(() => (total > 0 ? Math.round((yesVotes / total) * 100) : 0), [total, yesVotes]);
  const noPercent = total > 0 ? 100 - yesPercent : 0;

  const handleVote = async (support: boolean) => {
    try {
      setTransactionStatus("Ожидается подтверждение транзакции в кошельке");

      await writeContractAsync(
        {
          functionName: "vote",
          args: [support],
        },
        {
          onBlockConfirmation: async () => {
            await Promise.all([refetchResults(), refetchHasVoted()]);
            setTransactionStatus(`Голос "${support ? "За" : "Против"}" успешно записан в блокчейн`);
          },
        },
      );
    } catch (error) {
      console.error(error);
      setTransactionStatus("Ошибка: транзакция отклонена или пользователь уже голосовал");
    }
  };

  return (
    <main className="min-h-screen bg-base-200">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8 sm:py-12">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold sm:text-5xl">Прозрачное голосование «За / Против»</h1>
          <p className="max-w-2xl text-base text-base-content/70 sm:text-lg">
            Один адрес может проголосовать только один раз. Результаты читаются напрямую из смарт-контракта.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg bg-base-100 p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Результаты голосования</h2>
                <p className="text-sm text-base-content/60">Всего голосов: {total}</p>
              </div>
              <div className="badge badge-outline badge-lg">{hasVoted ? "Вы уже голосовали" : "Голос доступен"}</div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-success/30 bg-success/10 p-4">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircleIcon className="h-6 w-6" />
                  <span className="font-semibold">За</span>
                </div>
                <p className="mt-4 text-4xl font-bold">{yesVotes}</p>
                <progress className="progress progress-success mt-4 w-full" value={yesPercent} max="100" />
                <p className="mt-2 text-sm text-base-content/60">{yesPercent}% от общего числа</p>
              </div>

              <div className="rounded-lg border border-error/30 bg-error/10 p-4">
                <div className="flex items-center gap-2 text-error">
                  <XCircleIcon className="h-6 w-6" />
                  <span className="font-semibold">Против</span>
                </div>
                <p className="mt-4 text-4xl font-bold">{noVotes}</p>
                <progress className="progress progress-error mt-4 w-full" value={noPercent} max="100" />
                <p className="mt-2 text-sm text-base-content/60">{noPercent}% от общего числа</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-base-100 p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Ваш голос</h2>
            <div className="mt-3 min-h-12 rounded-lg bg-base-200 p-3 text-sm">
              {isConnected ? (
                <Address address={connectedAddress} chain={targetNetwork} />
              ) : (
                <span className="text-base-content/60">Подключите MetaMask</span>
              )}
            </div>

            <div className="mt-5 grid gap-3">
              <button
                className="btn btn-success w-full"
                disabled={!isConnected || Boolean(hasVoted) || isMining}
                onClick={() => handleVote(true)}
              >
                <CheckCircleIcon className="h-5 w-5" />
                Голосовать ЗА
              </button>
              <button
                className="btn btn-error w-full"
                disabled={!isConnected || Boolean(hasVoted) || isMining}
                onClick={() => handleVote(false)}
              >
                <XCircleIcon className="h-5 w-5" />
                Голосовать ПРОТИВ
              </button>
            </div>

            <div className="mt-5 rounded-lg border border-base-300 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">Статус транзакции</p>
              <p className="mt-1 text-sm">{isMining ? "Транзакция выполняется" : transactionStatus}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
