#include "KadenAdelynnGameMode.h"
#include "Kismet/GameplayStatics.h"
#include "Engine/World.h"
#include "TimerManager.h"
#include "Blueprint/UserWidget.h"
#include "Components/AudioComponent.h"
#include "Sound/SoundCue.h"

AKadenAdelynnGameMode::AKadenAdelynnGameMode()
{
	PrimaryActorTick.bCanEverTick = true;
	
	// Set default values
	Score = 0;
	GameTime = 0.0f;
	bGameIsPaused = false;
	bGameOver = false;
	
	// Set default pawn class
	DefaultPawnClass = nullptr; // Will be set in Blueprint
}

void AKadenAdelynnGameMode::BeginPlay()
{
	Super::BeginPlay();
	
	// Start spawn timers
	GetWorldTimerManager().SetTimer(CoinSpawnTimer, this, &AKadenAdelynnGameMode::SpawnCoin, CoinSpawnInterval, true);
	GetWorldTimerManager().SetTimer(SharkSpawnTimer, this, &AKadenAdelynnGameMode::SpawnShark, SharkSpawnInterval, true);
	GetWorldTimerManager().SetTimer(PowerUpSpawnTimer, this, &AKadenAdelynnGameMode::SpawnPowerUp, PowerUpSpawnInterval, true);
}

void AKadenAdelynnGameMode::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);
	
	if (!bGameIsPaused && !bGameOver)
	{
		GameTime += DeltaTime;
	}
}

void AKadenAdelynnGameMode::AddScore(int32 Points)
{
	if (!bGameOver)
	{
		Score += Points;
		
		// Play sound effect
		// TODO: Add sound effect for scoring
		
		// Check for achievements
		if (Score >= 100 && Score < 200)
		{
			// Achievement: First 100 points
		}
		else if (Score >= 500 && Score < 600)
		{
			// Achievement: 500 points
		}
	}
}

void AKadenAdelynnGameMode::PauseGame()
{
	bGameIsPaused = true;
	UGameplayStatics::SetGamePaused(GetWorld(), true);
}

void AKadenAdelynnGameMode::ResumeGame()
{
	bGameIsPaused = false;
	UGameplayStatics::SetGamePaused(GetWorld(), false);
}

void AKadenAdelynnGameMode::GameOver()
{
	bGameOver = true;
	bGameIsPaused = true;
	UGameplayStatics::SetGamePaused(GetWorld(), true);
	
	// Stop spawn timers
	GetWorldTimerManager().ClearTimer(CoinSpawnTimer);
	GetWorldTimerManager().ClearTimer(SharkSpawnTimer);
	GetWorldTimerManager().ClearTimer(PowerUpSpawnTimer);
	
	// Show game over UI
	// TODO: Create and show game over widget
}

void AKadenAdelynnGameMode::RestartGame()
{
	Score = 0;
	GameTime = 0.0f;
	bGameIsPaused = false;
	bGameOver = false;
	
	UGameplayStatics::SetGamePaused(GetWorld(), false);
	
	// Restart spawn timers
	GetWorldTimerManager().SetTimer(CoinSpawnTimer, this, &AKadenAdelynnGameMode::SpawnCoin, CoinSpawnInterval, true);
	GetWorldTimerManager().SetTimer(SharkSpawnTimer, this, &AKadenAdelynnGameMode::SpawnShark, SharkSpawnInterval, true);
	GetWorldTimerManager().SetTimer(PowerUpSpawnTimer, this, &AKadenAdelynnGameMode::SpawnPowerUp, PowerUpSpawnInterval, true);
	
	// Restart the level
	UGameplayStatics::OpenLevel(GetWorld(), FName(*GetWorld()->GetName()));
}

void AKadenAdelynnGameMode::SpawnCoin()
{
	if (bGameOver || bGameIsPaused)
		return;
		
	// Generate random spawn location
	float X = FMath::RandRange(-SpawnXRange, SpawnXRange);
	float Y = FMath::RandRange(-SpawnYRange, SpawnYRange);
	FVector SpawnLocation(X, Y, SpawnZHeight);
	
	// Spawn coin actor
	// TODO: Create coin class and spawn it
	// AActor* Coin = GetWorld()->SpawnActor<AActor>(CoinClass, SpawnLocation, FRotator::ZeroRotator);
	
	// Play spawn sound
	// TODO: Add coin spawn sound
}

void AKadenAdelynnGameMode::SpawnShark()
{
	if (bGameOver || bGameIsPaused)
		return;
		
	// Generate random spawn location
	float X = FMath::RandRange(-SpawnXRange, SpawnXRange);
	float Y = FMath::RandRange(-SpawnYRange, SpawnYRange);
	FVector SpawnLocation(X, Y, SpawnZHeight);
	
	// Spawn shark actor
	// TODO: Create shark class and spawn it
	// AActor* Shark = GetWorld()->SpawnActor<AActor>(SharkClass, SpawnLocation, FRotator::ZeroRotator);
	
	// Play spawn sound
	// TODO: Add shark spawn sound
}

void AKadenAdelynnGameMode::SpawnPowerUp()
{
	if (bGameOver || bGameIsPaused)
		return;
		
	// Generate random spawn location
	float X = FMath::RandRange(-SpawnXRange, SpawnXRange);
	float Y = FMath::RandRange(-SpawnYRange, SpawnYRange);
	FVector SpawnLocation(X, Y, SpawnZHeight);
	
	// Spawn power-up actor
	// TODO: Create power-up class and spawn it
	// AActor* PowerUp = GetWorld()->SpawnActor<AActor>(PowerUpClass, SpawnLocation, FRotator::ZeroRotator);
	
	// Play spawn sound
	// TODO: Add power-up spawn sound
} 