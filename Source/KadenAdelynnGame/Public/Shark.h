#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SphereComponent.h"
#include "Shark.generated.h"

UCLASS()
class KADENADELYNNGAME_API AShark : public AActor
{
	GENERATED_BODY()
	
public:	
	AShark();

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
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Shark Properties")
	float MovementSpeed = 300.0f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Shark Properties")
	float RotationSpeed = 45.0f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Shark Properties")
	float DamageAmount = 1.0f;

	// Events
	UFUNCTION(BlueprintCallable, Category = "Shark Events")
	void OnHitPlayer();

	UFUNCTION(BlueprintImplementableEvent, Category = "Shark Events")
	void OnHitPlayer_BP();

	// Overlap events
	UFUNCTION()
	void OnOverlapBegin(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

private:
	// Movement variables
	FVector TargetLocation;
	float MovementTimer;
	float DirectionChangeInterval;

	// Helper functions
	void SetNewTargetLocation();
}; 