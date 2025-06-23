#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SphereComponent.h"
#include "PowerUp.generated.h"

UENUM(BlueprintType)
enum class EPowerUpType : uint8
{
	SpeedBoost UMETA(DisplayName = "Speed Boost"),
	Shield UMETA(DisplayName = "Shield"),
	DoublePoints UMETA(DisplayName = "Double Points"),
	SlowMotion UMETA(DisplayName = "Slow Motion"),
	Missile UMETA(DisplayName = "Missile")
};

UCLASS()
class KADENADELYNNGAME_API APowerUp : public AActor
{
	GENERATED_BODY()
	
public:	
	APowerUp();

protected:
	virtual void BeginPlay() override;

public:	
	virtual void Tick(float DeltaTime) override;

	// Components
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UStaticMeshComponent* MeshComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	USphereComponent* CollisionComponent;

	// Properties
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "PowerUp Properties")
	EPowerUpType PowerUpType = EPowerUpType::SpeedBoost;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "PowerUp Properties")
	float Duration = 10.0f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "PowerUp Properties")
	float RotationSpeed = 90.0f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "PowerUp Properties")
	float BobSpeed = 3.0f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "PowerUp Properties")
	float BobHeight = 30.0f;

	// Events
	UFUNCTION(BlueprintCallable, Category = "PowerUp Events")
	void OnCollected();

	UFUNCTION(BlueprintImplementableEvent, Category = "PowerUp Events")
	void OnCollected_BP();

	// Overlap events
	UFUNCTION()
	void OnOverlapBegin(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

private:
	// Animation variables
	float InitialZ;
	float BobTime;
}; 