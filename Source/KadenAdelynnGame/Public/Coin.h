#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SphereComponent.h"
#include "Coin.generated.h"

UCLASS()
class KADENADELYNNGAME_API ACoin : public AActor
{
	GENERATED_BODY()
	
public:	
	ACoin();

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
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Coin Properties")
	int32 PointValue = 10;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Coin Properties")
	float RotationSpeed = 90.0f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Coin Properties")
	float BobSpeed = 2.0f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Coin Properties")
	float BobHeight = 20.0f;

	// Events
	UFUNCTION(BlueprintCallable, Category = "Coin Events")
	void OnCollected();

	UFUNCTION(BlueprintImplementableEvent, Category = "Coin Events")
	void OnCollected_BP();

	// Overlap events
	UFUNCTION()
	void OnOverlapBegin(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

private:
	// Animation variables
	float InitialZ;
	float BobTime;
}; 