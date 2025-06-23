#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "KadenAdelynnGameMode.generated.h"

UCLASS()
class KADENADELYNNGAME_API AKadenAdelynnGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	AKadenAdelynnGameMode();

protected:
	virtual void BeginPlay() override;

public:
	virtual void Tick(float DeltaTime) override;

	// Game state variables
	UPROPERTY(BlueprintReadWrite, Category = "Game State")
	int32 Score;

	UPROPERTY(BlueprintReadWrite, Category = "Game State")
	float GameTime;

	UPROPERTY(BlueprintReadWrite, Category = "Game State")
	bool bGameIsPaused;

	UPROPERTY(BlueprintReadWrite, Category = "Game State")
	bool bGameOver;

	// Game functions
	UFUNCTION(BlueprintCallable, Category = "Game Functions")
	void AddScore(int32 Points);

	UFUNCTION(BlueprintCallable, Category = "Game Functions")
	void PauseGame();

	UFUNCTION(BlueprintCallable, Category = "Game Functions")
	void ResumeGame();

	UFUNCTION(BlueprintCallable, Category = "Game Functions")
	void GameOver();

	UFUNCTION(BlueprintCallable, Category = "Game Functions")
	void RestartGame();

	// Spawn functions
	UFUNCTION(BlueprintCallable, Category = "Spawn Functions")
	void SpawnCoin();

	UFUNCTION(BlueprintCallable, Category = "Spawn Functions")
	void SpawnShark();

	UFUNCTION(BlueprintCallable, Category = "Spawn Functions")
	void SpawnPowerUp();

private:
	// Spawn timers
	FTimerHandle CoinSpawnTimer;
	FTimerHandle SharkSpawnTimer;
	FTimerHandle PowerUpSpawnTimer;

	// Spawn intervals
	UPROPERTY(EditAnywhere, Category = "Spawn Settings")
	float CoinSpawnInterval = 2.0f;

	UPROPERTY(EditAnywhere, Category = "Spawn Settings")
	float SharkSpawnInterval = 5.0f;

	UPROPERTY(EditAnywhere, Category = "Spawn Settings")
	float PowerUpSpawnInterval = 10.0f;

	// Spawn locations
	UPROPERTY(EditAnywhere, Category = "Spawn Settings")
	float SpawnXRange = 1000.0f;

	UPROPERTY(EditAnywhere, Category = "Spawn Settings")
	float SpawnYRange = 1000.0f;

	UPROPERTY(EditAnywhere, Category = "Spawn Settings")
	float SpawnZHeight = 500.0f;
}; 