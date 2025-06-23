#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SphereComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "Camera/CameraComponent.h"
#include "Components/InputComponent.h"
#include "Engine/World.h"
#include "TimerManager.h"
#include "PlayerCharacter.generated.h"

UENUM(BlueprintType)
enum class ECharacterType : uint8
{
    Boy         UMETA(DisplayName = "Boy"),
    Girl        UMETA(DisplayName = "Girl"),
    Car         UMETA(DisplayName = "Car"),
    Spaceship   UMETA(DisplayName = "Spaceship"),
    ArmyMan     UMETA(DisplayName = "Army Man"),
    Barbie      UMETA(DisplayName = "Barbie")
};

UENUM(BlueprintType)
enum class EPowerUpType : uint8
{
    SpeedBoost  UMETA(DisplayName = "Speed Boost"),
    Shield       UMETA(DisplayName = "Shield"),
    MultiShot    UMETA(DisplayName = "Multi Shot"),
    TimeFreeze   UMETA(DisplayName = "Time Freeze"),
    AutoAim      UMETA(DisplayName = "Auto Aim")
};

UCLASS()
class KADENADELYNNGAME_API APlayerCharacter : public ACharacter
{
    GENERATED_BODY()

public:
    APlayerCharacter();

protected:
    virtual void BeginPlay() override;

public:
    virtual void Tick(float DeltaTime) override;
    virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;

    // Character Selection
    UFUNCTION(BlueprintCallable, Category = "Character")
    void SetCharacterType(ECharacterType NewType);

    UFUNCTION(BlueprintPure, Category = "Character")
    ECharacterType GetCharacterType() const { return CharacterType; }

    // Movement
    UFUNCTION(BlueprintCallable, Category = "Movement")
    void MoveForward(float Value);

    UFUNCTION(BlueprintCallable, Category = "Movement")
    void MoveRight(float Value);

    UFUNCTION(BlueprintCallable, Category = "Movement")
    void Jump();

    // Combat
    UFUNCTION(BlueprintCallable, Category = "Combat")
    void FireMissile();

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void FireMultiShot();

    // Power-ups
    UFUNCTION(BlueprintCallable, Category = "PowerUps")
    void ActivatePowerUp(EPowerUpType PowerUpType);

    UFUNCTION(BlueprintCallable, Category = "PowerUps")
    void DeactivatePowerUp(EPowerUpType PowerUpType);

    UFUNCTION(BlueprintPure, Category = "PowerUps")
    bool IsPowerUpActive(EPowerUpType PowerUpType) const;

    // Gameplay
    UFUNCTION(BlueprintCallable, Category = "Gameplay")
    void CollectCoin();

    UFUNCTION(BlueprintCallable, Category = "Gameplay")
    void TakeDamage();

    UFUNCTION(BlueprintPure, Category = "Gameplay")
    int32 GetScore() const { return Score; }

    UFUNCTION(BlueprintPure, Category = "Gameplay")
    int32 GetHealth() const { return Health; }

    UFUNCTION(BlueprintPure, Category = "Gameplay")
    bool IsShieldActive() const { return bShieldActive; }

    // Components
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    USpringArmComponent* SpringArm;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    UCameraComponent* Camera;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    UStaticMeshComponent* CharacterMesh;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    USphereComponent* CollisionSphere;

    // Character Properties
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
    ECharacterType CharacterType;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
    float MovementSpeed;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
    float JumpForce;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
    int32 MaxHealth;

    // Gameplay Properties
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gameplay")
    int32 Score;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gameplay")
    int32 Health;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Gameplay")
    int32 CoinsCollected;

    // Power-up Properties
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "PowerUps")
    bool bSpeedBoostActive;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "PowerUps")
    bool bShieldActive;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "PowerUps")
    bool bMultiShotActive;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "PowerUps")
    bool bTimeFreezeActive;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "PowerUps")
    bool bAutoAimActive;

    // Power-up Timers
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "PowerUps")
    float SpeedBoostDuration;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "PowerUps")
    float ShieldDuration;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "PowerUps")
    float MultiShotDuration;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "PowerUps")
    float TimeFreezeDuration;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "PowerUps")
    float AutoAimDuration;

    // Combat Properties
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
    TSubclassOf<class AMissile> MissileClass;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
    FVector MissileSpawnOffset;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
    float FireRate;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
    bool bCanFire;

    // Character Meshes
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
    UStaticMesh* BoyMesh;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
    UStaticMesh* GirlMesh;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
    UStaticMesh* CarMesh;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
    UStaticMesh* SpaceshipMesh;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
    UStaticMesh* ArmyManMesh;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
    UStaticMesh* BarbieMesh;

    // Events
    UFUNCTION(BlueprintImplementableEvent, Category = "Events")
    void OnCoinCollected();

    UFUNCTION(BlueprintImplementableEvent, Category = "Events")
    void OnPowerUpActivated(EPowerUpType PowerUpType);

    UFUNCTION(BlueprintImplementableEvent, Category = "Events")
    void OnPowerUpDeactivated(EPowerUpType PowerUpType);

    UFUNCTION(BlueprintImplementableEvent, Category = "Events")
    void OnDamageTaken();

    UFUNCTION(BlueprintImplementableEvent, Category = "Events")
    void OnCharacterChanged(ECharacterType NewType);

private:
    // Timer handles
    FTimerHandle SpeedBoostTimer;
    FTimerHandle ShieldTimer;
    FTimerHandle MultiShotTimer;
    FTimerHandle TimeFreezeTimer;
    FTimerHandle AutoAimTimer;
    FTimerHandle FireRateTimer;

    // Helper functions
    void UpdateCharacterMesh();
    void UpdateMovementSpeed();
    void ResetFireRate();
}; 