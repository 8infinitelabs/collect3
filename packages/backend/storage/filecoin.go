package storage

import (
	"bytes"
	. "collect3/backend/utils"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"

	"github.com/ipfs/go-cid"
	carThings "github.com/ipld/go-car/v2"
	BlockStore "github.com/ipld/go-car/v2/blockstore"
	"github.com/multiformats/go-multicodec"
	"github.com/multiformats/go-multihash"
)

type filecoin struct {
	api_key string
}

func GetFilecoin(apiKey string) filecoin {
	return filecoin{api_key: apiKey}
}
func (storage filecoin) UploadFile(payload UploadFilePayload) (UploadFileResponse, error) {
	var response UploadFileResponse
	var body bytes.Buffer
	var err error
	var tempCarFile *os.File
	var tempFile *os.File

	tempCarFile, err = os.CreateTemp("", "article_")
	if err != nil {
		fmt.Println("CREATEFILE ERROR")
		fmt.Println("CREATEFILE ERROR")
		fmt.Println("CREATEFILE ERROR")
		fmt.Println("CREATEFILE ERROR")
		fmt.Println(err.Error())
		return UploadFileResponse{}, errors.New("Failed To Create Temp File")
	}
	//TODO: maybe is better to use a tempdir and clean with a cronjob or if the dir hits a certain size
	defer tempCarFile.Close()
	defer os.Remove(tempCarFile.Name())

	tempFile, err = os.CreateTemp("", "og_article_")
	if err != nil {
		fmt.Println("CREATEFILE ERROR")
		fmt.Println("CREATEFILE ERROR")
		fmt.Println("CREATEFILE ERROR")
		fmt.Println("CREATEFILE ERROR")
		fmt.Println(err.Error())
		return UploadFileResponse{}, errors.New("Failed To Create Temp File")
	}
	defer tempFile.Close()
	defer os.Remove(tempFile.Name())

	_, err = tempFile.WriteString(payload.File)
	if err != nil {
		fmt.Println("WRITE TO TEMP ERR")
		fmt.Println("WRITE TO TEMP ERR")
		fmt.Println("WRITE TO TEMP ERR")
		fmt.Println("WRITE TO TEMP ERR")
		fmt.Println(err.Error())
		return UploadFileResponse{}, errors.New("WRITE TO TEMP ERR")
	}

	newFile, err := os.Create("./test.car")
	if err != nil {
		fmt.Println("FAILED TO CREATE TEST FILE")
		fmt.Println("FAILED TO CREATE TEST FILE")
		fmt.Println("FAILED TO CREATE TEST FILE")
		fmt.Println("FAILED TO CREATE TEST FILE")
		fmt.Println("FAILED TO CREATE TEST FILE")

		fmt.Println(err.Error())
		return UploadFileResponse{}, errors.New("FAILED TO CREATE TEST FILE")
	}

	// make a cid with the right length that we eventually will patch with the root.
	hasher, err := multihash.GetHasher(multihash.SHA2_256)
	if err != nil {
		fmt.Println("CREATE HAHSHER ERROR")
		fmt.Println("CREATE HAHSHER ERROR")
		fmt.Println("CREATE HAHSHER ERROR")
		fmt.Println("CREATE HAHSHER ERROR")
		fmt.Println(err.Error())
		return UploadFileResponse{}, errors.New("CREATE HAHSHER ERROR")

	}
	digest := hasher.Sum([]byte{})
	hash, err := multihash.Encode(digest, multihash.SHA2_256)
	if err != nil {
		fmt.Println("CREATE HASH ERROR")
		fmt.Println("CREATE HASH ERROR")
		fmt.Println("CREATE HASH ERROR")
		fmt.Println("CREATE HASH ERROR")
		fmt.Println(err.Error())
		return UploadFileResponse{}, errors.New("CREATE HASH ERROR")
	}
	proxyRoot := cid.NewCidV1(uint64(multicodec.DagPb), hash)

	options := []carThings.Option{}

	blockreader, err := BlockStore.OpenReadWriteFile(tempCarFile, []cid.Cid{proxyRoot}, options...)

	if err != nil {
		fmt.Println("BLOCK READER ERROR")
		fmt.Println("BLOCK READER ERROR")
		fmt.Println("BLOCK READER ERROR")
		fmt.Println("BLOCK READER ERROR")
		fmt.Println(err.Error())
		return UploadFileResponse{}, errors.New("BLOCK READER ERROR")
	}

	root, err := WriteFiles(context.Background(), false, blockreader, tempFile.Name())

	if err != nil {
		fmt.Println("ERROR WRITING CAR FILE")
		fmt.Println("ERROR WRITING CAR FILE")
		fmt.Println("ERROR WRITING CAR FILE")
		fmt.Println("ERROR WRITING CAR FILE")
		return UploadFileResponse{}, errors.New("ERROR WRITING CAR FILE")
	}

	_, err = io.Copy(newFile, tempCarFile)
	if err != nil {
		fmt.Println("ERROR WRITING CAR FILE")
		fmt.Println("ERROR WRITING CAR FILE")
		fmt.Println("ERROR WRITING CAR FILE")
		fmt.Println("ERROR WRITING CAR FILE")
		fmt.Println(err.Error())
		return UploadFileResponse{}, errors.New("ERROR WRITING CAR FILE")
	}

	fmt.Println("CID: " + root.String())

	_, err = body.ReadFrom(tempCarFile)

	if err != nil {
		return UploadFileResponse{}, ErrorFailedToReadFile
	}

	if err := blockreader.Finalize(); err != nil {
		fmt.Println("ERROR CLOSING THE FILE")
		fmt.Println("ERROR CLOSING THE FILE")
		fmt.Println("ERROR CLOSING THE FILE")
		fmt.Println("ERROR CLOSING THE FILE")
		fmt.Println(err.Error())
		return UploadFileResponse{}, errors.New("ERROR CLOSING THE FILE")
	}

	err = carThings.ReplaceRootsInFile(tempCarFile.Name(), []cid.Cid{root})

	if err != nil {
		fmt.Println("ERROR FAILED TO REWRITE THE CID")
		fmt.Println("ERROR FAILED TO REWRITE THE CID")
		fmt.Println("ERROR FAILED TO REWRITE THE CID")
		fmt.Println("ERROR FAILED TO REWRITE THE CID")
		fmt.Println("ERROR FAILED TO REWRITE THE CID")
		fmt.Println(err.Error())
		return UploadFileResponse{}, errors.New("ERROR FAILED TO REWRITE THE CID")
	}

	url := "https://api.nft.storage/upload"
	req, err := http.NewRequest(http.MethodPost, url, &body)
	if err != nil {
		return UploadFileResponse{}, ErrorFailedToCreateClient
	}
	Logger.Info("Auth Header")
	Logger.Info("Bearer " + storage.api_key)
	req.Header.Set("Authorization", "Bearer "+storage.api_key)
	req.Header.Set("Content-Type", "application/car")

	res, err := http.DefaultClient.Do(req)

	if err != nil {
		return UploadFileResponse{}, ErrorFailedToUploadFile
	}

	if res.StatusCode != http.StatusOK {
		defer res.Body.Close()
		bodyBytes, err := io.ReadAll(res.Body)
		var bodyString = ""
		if err == nil {
			bodyString = string(bodyBytes)
		}
		Logger.Error(
			fmt.Sprintf("Failed To Upload File, Status %d", res.StatusCode),
			slog.String(
				"Response.Body",
				bodyString,
			),
		)
		if res.StatusCode == http.StatusBadRequest {
			return UploadFileResponse{}, ErrorBadRequest
		}
		if res.StatusCode == http.StatusUnauthorized {
			return UploadFileResponse{}, ErrorUnauthorized
		}
		return UploadFileResponse{}, ErrorNonOkay
	}

	err = json.NewDecoder(res.Body).Decode(&response)
	if err != nil {
		return UploadFileResponse{}, ErrorFailedToReadResponse
	}
	return response, nil

}

func (storage filecoin) DownloadFile(payload DownloadFilePayload) (string, error) {
	url := fmt.Sprintf("http://localhost:5050/s5/download/%s?auth_token=%s", payload.CID, payload.AuthToken)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return "", ErrorFailedToCreateClient
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", ErrorFailedToDownloadFile
	}
	if res.StatusCode != http.StatusOK {
		defer res.Body.Close()
		bodyBytes, err := io.ReadAll(res.Body)
		var bodyString = ""
		if err == nil {
			bodyString = string(bodyBytes)
		}
		Logger.Error(
			fmt.Sprintf("Failed To Download File, Status %d", res.StatusCode),
			slog.String(
				"Response.Body",
				bodyString,
			),
		)
		if res.StatusCode == http.StatusUnauthorized {
			return "", ErrorUnauthorized
		}
		if res.StatusCode == http.StatusNotFound {
			return "", ErrorNotFound
		}
		return "", ErrorNonOkay
	}

	defer res.Body.Close()

	file, err := io.ReadAll(res.Body)

	if err != nil {
		return "", ErrorFailedToReadFile
	}

	return string(file), nil
}
