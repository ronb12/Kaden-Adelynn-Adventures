#include "Characters/PlayerCharacter.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SphereComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "Camera/CameraComponent.h"
#include "Components/InputComponent.h"
#include "Engine/World.h"
#include "TimerManager.h"
#include "Kismet/GameplayStatics.h"
#include "KadenAdelynnGameMode.h"
#include "Missile.h"

APlayerCharacter::APlayerCharacter()
{
	PrimaryActorTick.bCanEverTick = true;

	// Create components
	SpringArm = CreateDefaultSubobject<USpringArmComponent>(TEXT("SpringArm"));
	SpringArm->SetupAttachment(RootComponent);
	SpringArm->TargetArmLength = 800.0f;
	SpringArm->SetRelativeRotation(FRotator(-45.0f, 0.0f, 0.0f));
	SpringArm->bDoCollisionTest = false;

	Camera = CreateDefaultSubobject<UCameraComponent>(TEXT("Camera"));
	Camera->SetupAttachment(SpringArm, USpringArmComponent::SocketName);

	CharacterMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("CharacterMesh"));
	CharacterMesh->SetupAttachment(RootComponent);

	CollisionSphere = CreateDefaultSubobject<USphereComponent>(TEXT("CollisionSphere"));
	CollisionSphere->SetupAttachment(RootComponent);
	CollisionSphere->SetSphereRadius(100.0f);

	// Set default values
	CharacterType = ECharacterType::Boy;
	MovementSpeed = 600.0f;
	JumpForce = 500.0f;
	MaxHealth = 3;
	Health = MaxHealth;
	Score = 0;
	CoinsCollected = 0;

	// Power-up defaults
	bSpeedBoostActive = false;
	bShieldActive = false;
	bMultiShotActive = false;
	bTimeFreezeActive = false;
	bAutoAimActive = false;

	SpeedBoostDuration = 10.0f;
	ShieldDuration = 15.0f;
	MultiShotDuration = 12.0f;
	TimeFreezeDuration = 8.0f;
	AutoAimDuration = 10.0f;

	// Combat defaults
	MissileSpawnOffset = FVector(0.0f, 0.0f, 100.0f);
	FireRate = 0.5f;
	bCanFire = true;
}

void APlayerCharacter::BeginPlay()
{
	Super::BeginPlay();
	
	UpdateCharacterMesh();
	UpdateMovementSpeed();
}

void APlayerCharacter::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);
}

void APlayerCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);

	// Bind movement functions
	PlayerInputComponent->BindAxis("MoveForward", this, &APlayerCharacter::MoveForward);
	PlayerInputComponent->BindAxis("MoveRight", this, &APlayerCharacter::MoveRight);

	// Bind action functions
	PlayerInputComponent->BindAction("Jump", IE_Pressed, this, &APlayerCharacter::Jump);
	PlayerInputComponent->BindAction("Fire", IE_Pressed, this, &APlayerCharacter::FireMissile);
}

void APlayerCharacter::SetCharacterType(ECharacterType NewType)
{
	CharacterType = NewType;
	UpdateCharacterMesh();
	OnCharacterChanged(NewType);
}

void APlayerCharacter::MoveForward(float Value)
{
	if (Value != 0.0f)
	{
		FVector Direction = GetActorForwardVector();
		AddMovementInput(Direction, Value);
	}
}

void APlayerCharacter::MoveRight(float Value)
{
	if (Value != 0.0f)
	{
		FVector Direction = GetActorRightVector();
		AddMovementInput(Direction, Value);
	}
}

void APlayerCharacter::Jump()
{
	Super::Jump();
}

void APlayerCharacter::FireMissile()
{
	if (!bCanFire || !MissileClass)
		return;

	// Calculate spawn location
	FVector SpawnLocation = GetActorLocation() + GetActorRotation().RotateVector(MissileSpawnOffset);
	FRotator SpawnRotation = GetActorRotation();

	// Spawn missile
	AMissile* Missile = GetWorld()->SpawnActor<AMissile>(MissileClass, SpawnLocation, SpawnRotation);
	if (Missile)
	{
		// Set missile properties based on power-ups
		if (bMultiShotActive)
		{
			// Spawn additional missiles for multi-shot
			FVector LeftOffset = SpawnLocation + FVector(0.0f, -50.0f, 0.0f);
			FVector RightOffset = SpawnLocation + FVector(0.0f, 50.0f, 0.0f);
			
			GetWorld()->SpawnActor<AMissile>(MissileClass, LeftOffset, SpawnRotation);
			GetWorld()->SpawnActor<AMissile>(MissileClass, RightOffset, SpawnRotation);
		}
	}

	// Set fire rate timer
	bCanFire = false;
	GetWorldTimerManager().SetTimer(FireRateTimer, this, &APlayerCharacter::ResetFireRate, FireRate, false);
}

void APlayerCharacter::FireMultiShot()
{
	// This is handled in FireMissile when bMultiShotActive is true
}

void APlayerCharacter::ActivatePowerUp(EPowerUpType PowerUpType)
{
	switch (PowerUpType)
	{
	case EPowerUpType::SpeedBoost:
		if (!bSpeedBoostActive)
		{
			bSpeedBoostActive = true;
			UpdateMovementSpeed();
			GetWorldTimerManager().SetTimer(SpeedBoostTimer, this, &APlayerCharacter::DeactivatePowerUp, SpeedBoostDuration, false);
			OnPowerUpActivated(PowerUpType);
		}
		break;

	case EPowerUpType::Shield:
		if (!bShieldActive)
		{
			bShieldActive = true;
			GetWorldTimerManager().SetTimer(ShieldTimer, this, &APlayerCharacter::DeactivatePowerUp, ShieldDuration, false);
			OnPowerUpActivated(PowerUpType);
		}
		break;

	case EPowerUpType::MultiShot:
		if (!bMultiShotActive)
		{
			bMultiShotActive = true;
			GetWorldTimerManager().SetTimer(MultiShotTimer, this, &APlayerCharacter::DeactivatePowerUp, MultiShotDuration, false);
			OnPowerUpActivated(PowerUpType);
		}
		break;

	case EPowerUpType::TimeFreeze:
		if (!bTimeFreezeActive)
		{
			bTimeFreezeActive = true;
			UGameplayStatics::SetGlobalTimeDilation(GetWorld(), 0.3f);
			GetWorldTimerManager().SetTimer(TimeFreezeTimer, this, &APlayerCharacter::DeactivatePowerUp, TimeFreezeDuration, false);
			OnPowerUpActivated(PowerUpType);
		}
		break;

	case EPowerUpType::AutoAim:
		if (!bAutoAimActive)
		{
			bAutoAimActive = true;
			GetWorldTimerManager().SetTimer(AutoAimTimer, this, &APlayerCharacter::DeactivatePowerUp, AutoAimDuration, false);
			OnPowerUpActivated(PowerUpType);
		}
		break;
	}
}

void APlayerCharacter::DeactivatePowerUp(EPowerUpType PowerUpType)
{
	switch (PowerUpType)
	{
	case EPowerUpType::SpeedBoost:
		bSpeedBoostActive = false;
		UpdateMovementSpeed();
		OnPowerUpDeactivated(PowerUpType);
		break;

	case EPowerUpType::Shield:
		bShieldActive = false;
		OnPowerUpDeactivated(PowerUpType);
		break;

	case EPowerUpType::MultiShot:
		bMultiShotActive = false;
		OnPowerUpDeactivated(PowerUpType);
		break;

	case EPowerUpType::TimeFreeze:
		bTimeFreezeActive = false;
		UGameplayStatics::SetGlobalTimeDilation(GetWorld(), 1.0f);
		OnPowerUpDeactivated(PowerUpType);
		break;

	case EPowerUpType::AutoAim:
		bAutoAimActive = false;
		OnPowerUpDeactivated(PowerUpType);
		break;
	}
}

bool APlayerCharacter::IsPowerUpActive(EPowerUpType PowerUpType) const
{
	switch (PowerUpType)
	{
	case EPowerUpType::SpeedBoost:
		return bSpeedBoostActive;
	case EPowerUpType::Shield:
		return bShieldActive;
	case EPowerUpType::MultiShot:
		return bMultiShotActive;
	case EPowerUpType::TimeFreeze:
		return bTimeFreezeActive;
	case EPowerUpType::AutoAim:
		return bAutoAimActive;
	default:
		return false;
	}
}

void APlayerCharacter::CollectCoin()
{
	CoinsCollected++;
	Score += 10;
	OnCoinCollected();
}

void APlayerCharacter::TakeDamage()
{
	if (bShieldActive)
	{
		// Shield absorbs damage
		bShieldActive = false;
		GetWorldTimerManager().ClearTimer(ShieldTimer);
		OnPowerUpDeactivated(EPowerUpType::Shield);
	}
	else
	{
		Health--;
		OnDamageTaken();

		if (Health <= 0)
		{
			// Game over
			if (AKadenAdelynnGameMode* GameMode = Cast<AKadenAdelynnGameMode>(UGameplayStatics::GetGameMode(GetWorld())))
			{
				GameMode->GameOver();
			}
		}
	}
}

void APlayerCharacter::UpdateCharacterMesh()
{
	UStaticMesh* MeshToUse = nullptr;

	switch (CharacterType)
	{
	case ECharacterType::Boy:
		MeshToUse = BoyMesh;
		break;
	case ECharacterType::Girl:
		MeshToUse = GirlMesh;
		break;
	case ECharacterType::Car:
		MeshToUse = CarMesh;
		break;
	case ECharacterType::Spaceship:
		MeshToUse = SpaceshipMesh;
		break;
	case ECharacterType::ArmyMan:
		MeshToUse = ArmyManMesh;
		break;
	case ECharacterType::Barbie:
		MeshToUse = BarbieMesh;
		break;
	}

	if (MeshToUse)
	{
		CharacterMesh->SetStaticMesh(MeshToUse);
	}
}

void APlayerCharacter::UpdateMovementSpeed()
{
	float SpeedMultiplier = bSpeedBoostActive ? 2.0f : 1.0f;
	GetCharacterMovement()->MaxWalkSpeed = MovementSpeed * SpeedMultiplier;
}

void APlayerCharacter::ResetFireRate()
{
	bCanFire = true;
} 